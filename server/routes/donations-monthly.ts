import type { RequestHandler } from "express";
import type { MonthlyDonationCheckoutResponse } from "../../shared/donations";
import { createMonthlyDonationSchema } from "../lib/donation-validation";
import {
  buildSiDetails,
  formatPayUAmount,
  generateConsentHash,
  generateTxnId,
  getPayUConfig,
  serializeSiDetails,
} from "../lib/payu";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function createCheckoutPayload(body: unknown): {
  error?: { status: number; body: { error: string; code: string } };
  checkout?: MonthlyDonationCheckoutResponse;
  sameSalt?: boolean;
} {
  try {
    const config = getPayUConfig();
    const parsed = createMonthlyDonationSchema(config.maxMonthlyAmount).safeParse(
      body,
    );

    if (!parsed.success) {
      return {
        error: {
          status: 400,
          body: {
            error: parsed.error.issues[0]?.message || "Invalid donation request",
            code: "VALIDATION_ERROR",
          },
        },
      };
    }

    const { amount, name, email, phone } = parsed.data;
    const amountFormatted = formatPayUAmount(amount);
    const txnid = generateTxnId();
    const productinfo = "Shikshantar monthly donation";
    const siDetails = buildSiDetails(
      amountFormatted,
      config.subscriptionEndYears,
    );
    const siDetailsJson = serializeSiDetails(siDetails);

    const hash = generateConsentHash({
      key: config.key,
      saltV1: config.saltV1,
      saltV2: config.saltV2,
      useDualHash: config.useDualHash,
      txnid,
      amount: amountFormatted,
      productinfo,
      firstname: name,
      email,
      siDetailsJson,
    });

    const checkout: MonthlyDonationCheckoutResponse = {
      paymentUrl: config.paymentUrl,
      fields: {
        key: config.key,
        txnid,
        amount: amountFormatted,
        productinfo,
        firstname: name,
        email,
        phone,
        surl: `${config.apiUrl}/api/payu/success`,
        furl: `${config.apiUrl}/api/payu/failure`,
        api_version: "7",
        si: "4",
        si_details: siDetailsJson,
        hash,
      },
    };

    return {
      checkout,
      sameSalt: !config.useDualHash,
    };
  } catch (error) {
    const unavailable =
      error instanceof Error && error.message === "PayU is not configured";
    return {
      error: {
        status: 503,
        body: {
          error: unavailable
            ? "Donation payments are temporarily unavailable"
            : "Unable to start donation checkout",
          code: "CHECKOUT_ERROR",
        },
      },
    };
  }
}

function payuAutoSubmitHtml(checkout: MonthlyDonationCheckoutResponse): string {
  const inputs = Object.entries(checkout.fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting to PayU…</title>
</head>
<body>
  <p>Redirecting securely to PayU…</p>
  <form id="payu" method="post" action="${escapeHtml(checkout.paymentUrl)}">
    ${inputs}
  </form>
  <script>document.getElementById("payu").submit();</script>
</body>
</html>`;
}

export const handleMonthlyDonation: RequestHandler = (req, res) => {
  const result = createCheckoutPayload(req.body);
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  if (result.sameSalt) {
    console.info(
      "[donations/monthly] single-salt hash mode (live-style key+salt). Set PAYU_SALT_V2 only for test accounts that show Salt-256 bit.",
    );
  }

  console.info("[donations/monthly] checkout initiated", {
    txnid: result.checkout!.fields.txnid,
    amount: result.checkout!.fields.amount,
    dualSalt: !result.sameSalt,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json(result.checkout);
};

/**
 * Server-rendered auto-submit form to PayU.
 * Prefer this over client-built forms so JSON hash/si_details are HTML-escaped correctly.
 */
export const handleMonthlyDonationRedirect: RequestHandler = (req, res) => {
  const result = createCheckoutPayload(req.body);
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  if (result.sameSalt) {
    console.info(
      "[donations/monthly/redirect] single-salt hash mode (live-style key+salt).",
    );
  }

  console.info("[donations/monthly/redirect] checkout initiated", {
    txnid: result.checkout!.fields.txnid,
    amount: result.checkout!.fields.amount,
    dualSalt: !result.sameSalt,
    surl: result.checkout!.fields.surl,
    timestamp: new Date().toISOString(),
  });

  res
    .status(200)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .send(payuAutoSubmitHtml(result.checkout!));
};
