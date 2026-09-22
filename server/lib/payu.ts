import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type PayUConfig = {
  key: string;
  /** Primary salt (live: only salt; test: Salt - 32 bit) */
  saltV1: string;
  /** Optional Salt - 256 bit (test accounts). Empty on live if not provided. */
  saltV2: string;
  /** True when both 32-bit and 256-bit salts are configured and differ */
  useDualHash: boolean;
  paymentUrl: string;
  environment: "test" | "production";
  frontendUrl: string;
  apiUrl: string;
  maxMonthlyAmount: number;
  subscriptionEndYears: number;
};

export function getPayUConfig(): PayUConfig {
  const key = process.env.PAYU_KEY?.trim();
  // Live PayU often has only key + salt.
  // Test PayU may show Salt-32bit + Salt-256bit → dual JSON hash.
  const saltV1 =
    process.env.PAYU_SALT_V1?.trim() || process.env.PAYU_SALT?.trim() || "";
  const saltV2Explicit = process.env.PAYU_SALT_V2?.trim() || "";
  const saltV2 = saltV2Explicit;
  const useDualHash = Boolean(saltV2 && saltV2 !== saltV1);

  if (!key || !saltV1) {
    throw new Error("PayU is not configured");
  }

  const environment =
    process.env.PAYU_ENVIRONMENT === "production" ? "production" : "test";

  const defaultPaymentUrl =
    environment === "production"
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment";

  const frontendUrl = (
    process.env.FRONTEND_URL || "https://myshiksha.org"
  ).replace(/\/$/, "");
  const apiUrl = (process.env.API_URL || frontendUrl).replace(/\/$/, "");

  return {
    key,
    saltV1,
    saltV2: useDualHash ? saltV2 : saltV1,
    useDualHash,
    paymentUrl: process.env.PAYU_PAYMENT_URL?.trim() || defaultPaymentUrl,
    environment,
    frontendUrl,
    apiUrl,
    maxMonthlyAmount: Number(process.env.PAYU_MAX_MONTHLY_AMOUNT || 15000),
    subscriptionEndYears: Number(process.env.PAYU_SUBSCRIPTION_END_YEARS || 10),
  };
}

/** Format INR amount as PayU expects (two decimal places). */
export function formatPayUAmount(amount: number): string {
  return amount.toFixed(2);
}

/** YYYY-MM-DD in Asia/Kolkata — required for UPI paymentStartDate = today. */
export function todayISTDateString(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addYearsIST(years: number, now = new Date()): string {
  const parts = todayISTDateString(now).split("-").map(Number);
  const [y, m, d] = parts;
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCFullYear(date.getUTCFullYear() + years);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Unique txnid per attempt. PayU limit: 25 chars.
 * Never reuse a successful txnid.
 */
export function generateTxnId(): string {
  const stamp = Date.now().toString(36);
  const rand = randomBytes(4).toString("hex");
  return `m${stamp}${rand}`.slice(0, 25);
}

export type SiDetails = {
  billingAmount: string;
  billingCurrency: "INR";
  billingCycle: "MONTHLY";
  billingInterval: 1;
  paymentStartDate: string;
  paymentEndDate: string;
};

export function buildSiDetails(
  amountFormatted: string,
  endYears: number,
  now = new Date(),
): SiDetails {
  return {
    billingAmount: amountFormatted,
    billingCurrency: "INR",
    billingCycle: "MONTHLY",
    billingInterval: 1,
    paymentStartDate: todayISTDateString(now),
    paymentEndDate: addYearsIST(endYears, now),
  };
}

/** Compact JSON string for form post + hash (no spaces). */
export function serializeSiDetails(details: SiDetails): string {
  return JSON.stringify(details);
}

function sha512Hex(value: string): string {
  return createHash("sha512").update(value).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a.toLowerCase());
    const bb = Buffer.from(b.toLowerCase());
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/**
 * Build the consent hash preimage (without salt).
 * Docs show: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||si_details|SALT
 * With empty UDFs that is 11 pipes between email and si_details (10 empty segments), not 12.
 * @see https://docs.payu.in/reference/payment-consent-transaction-payu-hosted
 */
export function buildConsentHashPreimage(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  siDetailsJson: string;
}): string {
  return [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 ?? "",
    params.udf2 ?? "",
    params.udf3 ?? "",
    params.udf4 ?? "",
    params.udf5 ?? "",
    "",
    "",
    "",
    "",
    "",
    params.siDetailsJson,
  ].join("|");
}

/**
 * PayU Hosted Consent / Pay-and-Subscribe request hash.
 *
 * - Live (single salt): plain sha512 hex
 * - Test with Salt-32bit + Salt-256bit: {"v1":"...","v2":"..."}
 */
export function generateConsentHash(params: {
  key: string;
  saltV1: string;
  saltV2?: string;
  useDualHash?: boolean;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  siDetailsJson: string;
}): string {
  const preimage = buildConsentHashPreimage(params);
  const primary = sha512Hex(`${preimage}|${params.saltV1}`);

  const dual =
    params.useDualHash === true ||
    (Boolean(params.saltV2) && params.saltV2 !== params.saltV1);

  if (!dual || !params.saltV2) {
    return primary;
  }

  const v2 = sha512Hex(`${preimage}|${params.saltV2}`);
  return JSON.stringify({ v1: primary, v2 });
}

/**
 * Reverse hash for PayU browser callback verification.
 * SHA512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function generateReverseHash(params: {
  salt: string;
  key: string;
  status: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  const sequence = [
    params.salt,
    params.status,
    "",
    "",
    "",
    "",
    "",
    params.udf5 ?? "",
    params.udf4 ?? "",
    params.udf3 ?? "",
    params.udf2 ?? "",
    params.udf1 ?? "",
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    params.key,
  ].join("|");

  return sha512Hex(sequence);
}

function extractHashCandidates(received: string): string[] {
  const trimmed = received.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as { v1?: string; v2?: string };
      return [parsed.v1, parsed.v2].filter(Boolean) as string[];
    } catch {
      return [trimmed];
    }
  }

  return [trimmed];
}

export function verifyReverseHash(
  body: Record<string, unknown>,
  salts: string | string[],
  key: string,
): boolean {
  const received = String(body.hash ?? "");
  const candidates = extractHashCandidates(received);
  if (!candidates.length) return false;

  const saltList = (Array.isArray(salts) ? salts : [salts]).filter(Boolean);

  for (const salt of saltList) {
    const expected = generateReverseHash({
      salt,
      key,
      status: String(body.status ?? ""),
      email: String(body.email ?? ""),
      firstname: String(body.firstname ?? ""),
      productinfo: String(body.productinfo ?? ""),
      amount: String(body.amount ?? ""),
      txnid: String(body.txnid ?? ""),
      udf1: String(body.udf1 ?? ""),
      udf2: String(body.udf2 ?? ""),
      udf3: String(body.udf3 ?? ""),
      udf4: String(body.udf4 ?? ""),
      udf5: String(body.udf5 ?? ""),
    });

    if (candidates.some((c) => safeEqualHex(c, expected))) {
      return true;
    }
  }

  return false;
}

/** Safe fields to log — never salt, secrets, card, CVV. */
export function sanitizePayULog(body: Record<string, unknown>) {
  return {
    txnid: body.txnid,
    mihpayid: body.mihpayid,
    status: body.status,
    unmappedstatus: body.unmappedstatus,
    amount: body.amount,
    mode: body.mode,
    payment_source: body.payment_source,
    bankcode: body.bankcode,
    error: body.error,
    error_Message: body.error_Message,
    productinfo: body.productinfo,
    field9: body.field9,
    timestamp: new Date().toISOString(),
  };
}
