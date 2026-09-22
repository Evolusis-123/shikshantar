import { describe, expect, it } from "vitest";
import { createMonthlyDonationSchema } from "../lib/donation-validation";
import {
  generateConsentHash,
  generateReverseHash,
  generateTxnId,
  serializeSiDetails,
  verifyReverseHash,
} from "../lib/payu";

const schema = createMonthlyDonationSchema(15000);

describe("monthly donation validation", () => {
  it("accepts ₹500, ₹750, ₹1000", () => {
    for (const amount of [500, 750, 1000]) {
      const result = schema.safeParse({ amount, email: "a@b.com", phone: "9876543210" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.amount).toBe(amount);
    }
  });

  it("rejects invalid amounts", () => {
    for (const amount of [499, 0, -10, NaN, Infinity, "12.345", "abc"]) {
      const result = schema.safeParse({ amount, email: "a@b.com", phone: "9876543210" });
      expect(result.success).toBe(false);
    }
  });
});

describe("payu hash", () => {
  it("generates unique txnids", () => {
    const a = generateTxnId();
    const b = generateTxnId();
    expect(a).not.toEqual(b);
    expect(a.length).toBeLessThanOrEqual(25);
  });

  it("builds consent hash deterministically", () => {
    const si = serializeSiDetails({
      billingAmount: "750.00",
      billingCurrency: "INR",
      billingCycle: "MONTHLY",
      billingInterval: 1,
      paymentStartDate: "2026-09-22",
      paymentEndDate: "2036-09-22",
    });

    const hash = generateConsentHash({
      key: "testkey",
      salt: "testsalt",
      txnid: "m123",
      amount: "750.00",
      productinfo: "Shikshantar monthly donation",
      firstname: "Donor",
      email: "donor@example.com",
      siDetailsJson: si,
    });

    expect(hash).toHaveLength(128);
    expect(
      generateConsentHash({
        key: "testkey",
        salt: "testsalt",
        txnid: "m123",
        amount: "750.00",
        productinfo: "Shikshantar monthly donation",
        firstname: "Donor",
        email: "donor@example.com",
        siDetailsJson: si,
      }),
    ).toEqual(hash);
  });

  it("verifies reverse hash", () => {
    const salt = "testsalt";
    const key = "testkey";
    const body = {
      status: "success",
      email: "donor@example.com",
      firstname: "Donor",
      productinfo: "Shikshantar monthly donation",
      amount: "750.00",
      txnid: "m123",
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",
      hash: "",
    };
    body.hash = generateReverseHash({
      salt,
      key,
      status: body.status,
      email: body.email,
      firstname: body.firstname,
      productinfo: body.productinfo,
      amount: body.amount,
      txnid: body.txnid,
    });
    expect(verifyReverseHash(body, salt, key)).toBe(true);
    expect(verifyReverseHash({ ...body, hash: "deadbeef" }, salt, key)).toBe(false);
  });
});
