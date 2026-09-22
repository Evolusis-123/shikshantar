/**
 * Shared donation API types (safe for client + server).
 * Never put PayU secrets in this file.
 */

export const MIN_MONTHLY_DONATION_INR = 1000;

export interface MonthlyDonationRequest {
  amount: number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface PayUCheckoutFields {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  api_version: string;
  si: string;
  si_details: string;
  hash: string;
}

export interface MonthlyDonationCheckoutResponse {
  paymentUrl: string;
  fields: PayUCheckoutFields;
}

export interface DonationApiError {
  error: string;
  code?: string;
}
