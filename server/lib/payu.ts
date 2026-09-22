import { createHash, randomBytes } from "node:crypto";

export type PayUConfig = {
  key: string;
  salt: string;
  paymentUrl: string;
  environment: "test" | "production";
  frontendUrl: string;
  apiUrl: string;
  maxMonthlyAmount: number;
  subscriptionEndYears: number;
};

export function getPayUConfig(): PayUConfig {
  const key = process.env.PAYU_KEY?.trim();
  const salt = process.env.PAYU_SALT?.trim();
  if (!key || !salt) {
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
    salt,
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

/**
 * PayU Hosted Consent / Pay-and-Subscribe request hash.
 * Docs: SHA512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||si_details|SALT)
 * @see https://docs.payu.in/reference/payment-consent-transaction-payu-hosted
 */
export function generateConsentHash(params: {
  key: string;
  salt: string;
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
  const sequence = [
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
    "",
    params.siDetailsJson,
    params.salt,
  ].join("|");

  return createHash("sha512").update(sequence).digest("hex");
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

  return createHash("sha512").update(sequence).digest("hex");
}

export function verifyReverseHash(
  body: Record<string, unknown>,
  salt: string,
  key: string,
): boolean {
  const received = String(body.hash ?? "");
  if (!received) return false;

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

  return expected.toLowerCase() === received.toLowerCase();
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
