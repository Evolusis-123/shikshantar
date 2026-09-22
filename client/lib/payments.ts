/** Public one-time PayU payment-page URLs (not secrets). */

const fallbackCustom = "https://u.payu.in/9r1hv1tnAno5";
const fallback1000 = "https://u.payu.in/PAYUMN/Ird2vjwZHq8Z";
/** Former ₹500 payment page — now used for ₹2000. */
const fallback2000 = "https://u.payu.in/PAYUMN/RIUiX0nf38b6";

export const PAYU_CUSTOM =
  import.meta.env.VITE_PAYU_CUSTOM_DONATION_URL || fallbackCustom;

export const PAYU_1000 =
  import.meta.env.VITE_PAYU_FIXED_1000_URL ||
  import.meta.env.VITE_PAYU_FIXED_DONATION_URL ||
  fallback1000;

export const PAYU_2000 =
  import.meta.env.VITE_PAYU_FIXED_2000_URL ||
  import.meta.env.VITE_PAYU_FIXED_500_URL || // legacy env name
  fallback2000;
