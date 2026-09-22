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

export const handleMonthlyDonation: RequestHandler = (req, res) => {
  try {
    const config = getPayUConfig();
    const parsed = createMonthlyDonationSchema(config.maxMonthlyAmount).safeParse(
      req.body,
    );

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message || "Invalid donation request";
      return res.status(400).json({ error: message, code: "VALIDATION_ERROR" });
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
      salt: config.salt,
      txnid,
      amount: amountFormatted,
      productinfo,
      firstname: name,
      email,
      siDetailsJson,
    });

    const response: MonthlyDonationCheckoutResponse = {
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

    console.info("[donations/monthly] checkout initiated", {
      txnid,
      amount: amountFormatted,
      environment: config.environment,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json(response);
  } catch (error) {
    const message =
      error instanceof Error && error.message === "PayU is not configured"
        ? "Donation payments are temporarily unavailable"
        : "Unable to start donation checkout";
    console.error("[donations/monthly] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return res.status(503).json({ error: message, code: "CHECKOUT_ERROR" });
  }
};
