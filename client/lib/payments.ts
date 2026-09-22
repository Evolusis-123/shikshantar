/** Public one-time PayU payment-page URLs (not secrets). */

const fallbackCustom = "https://u.payu.in/9r1hv1tnAno5";
const fallback500 = "https://u.payu.in/PAYUMN/RIUiX0nf38b6";
const fallback1000 = "https://u.payu.in/PAYUMN/Ird2vjwZHq8Z";

export const PAYU_CUSTOM =
  import.meta.env.VITE_PAYU_CUSTOM_DONATION_URL || fallbackCustom;

export const PAYU_500 =
  import.meta.env.VITE_PAYU_FIXED_500_URL || fallback500;

export const PAYU_1000 =
  import.meta.env.VITE_PAYU_FIXED_DONATION_URL || fallback1000;
