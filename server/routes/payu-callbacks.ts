import type { RequestHandler } from "express";
import {
  getPayUConfig,
  sanitizePayULog,
  verifyReverseHash,
} from "../lib/payu";

function asRecord(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  return {};
}

function mergePayload(req: {
  body?: unknown;
  query?: unknown;
}): Record<string, unknown> {
  return { ...asRecord(req.query), ...asRecord(req.body) };
}

function redirectToFrontend(
  res: Parameters<RequestHandler>[1],
  path: "/donation/success" | "/donation/failed",
  params: Record<string, string | undefined>,
) {
  try {
    const { frontendUrl } = getPayUConfig();
    const url = new URL(path, frontendUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
    return res.redirect(302, url.toString());
  } catch {
    return res.redirect(302, path);
  }
}

export const handlePayUSuccess: RequestHandler = (req, res) => {
  const payload = mergePayload(req);
  let config;
  try {
    config = getPayUConfig();
  } catch {
    return redirectToFrontend(res, "/donation/failed", {
      reason: "config",
    });
  }

  const valid = verifyReverseHash(payload, [config.saltV1, config.saltV2], config.key);
  const log = sanitizePayULog(payload);

  if (!valid) {
    console.warn("[payu/success] invalid hash", log);
    return redirectToFrontend(res, "/donation/failed", {
      reason: "invalid",
      txnid: String(payload.txnid || ""),
    });
  }

  const status = String(payload.status || "").toLowerCase();
  const paymentSource = String(payload.payment_source || "").toLowerCase();
  const unmapped = String(payload.unmappedstatus || "").toLowerCase();

  const mandateOk =
    status === "success" &&
    (unmapped === "captured" || unmapped === "auth") &&
    (paymentSource === "sist" || paymentSource === "payu" || !paymentSource);

  console.info("[payu/success] verified callback", {
    ...log,
    mandateOk,
  });

  if (status !== "success") {
    return redirectToFrontend(res, "/donation/failed", {
      reason: "payment",
      txnid: String(payload.txnid || ""),
    });
  }

  // payment_source=sist => mandate + payment success; payu with success may mean payment ok / mandate pending
  return redirectToFrontend(res, "/donation/success", {
    txnid: String(payload.txnid || ""),
    amount: String(payload.amount || ""),
    mandate: paymentSource === "sist" ? "1" : "0",
  });
};

export const handlePayUFailure: RequestHandler = (req, res) => {
  const payload = mergePayload(req);
  let config;
  try {
    config = getPayUConfig();
  } catch {
    return redirectToFrontend(res, "/donation/failed", { reason: "config" });
  }

  const valid = verifyReverseHash(payload, [config.saltV1, config.saltV2], config.key);
  const log = sanitizePayULog(payload);

  if (!valid) {
    console.warn("[payu/failure] invalid hash", log);
  } else {
    console.info("[payu/failure] verified callback", log);
  }

  return redirectToFrontend(res, "/donation/failed", {
    reason: valid ? "payment" : "invalid",
    txnid: String(payload.txnid || ""),
  });
};

/**
 * V1 webhook: verify reverse hash when present, log safe fields, ack 200.
 * PayU remains system of record — no DB write.
 */
export const handlePayUWebhook: RequestHandler = (req, res) => {
  const payload = mergePayload(req);
  let config;
  try {
    config = getPayUConfig();
  } catch {
    return res.status(503).json({ ok: false });
  }

  const hasHash = Boolean(payload.hash);
  const valid = hasHash
    ? verifyReverseHash(payload, [config.saltV1, config.saltV2], config.key)
    : false;

  const log = sanitizePayULog(payload);

  if (hasHash && !valid) {
    console.warn("[payu/webhook] rejected unverified event", log);
    return res.status(400).json({ ok: false });
  }

  console.info("[payu/webhook] event", {
    ...log,
    verified: valid,
    event:
      payload.event ||
      payload.event_type ||
      payload.notification_type ||
      payload.status,
  });

  return res.status(200).json({ ok: true });
};
