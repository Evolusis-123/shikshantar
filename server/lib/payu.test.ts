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
  it("accepts ₹1000, ₹1500, ₹2000", () => {
    for (const amount of [1000, 1500, 2000]) {
      const result = schema.safeParse({
        amount,
        email: "a@b.com",
        phone: "9876543210",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.amount).toBe(amount);
    }
  });

  it("rejects invalid amounts", () => {
    for (const amount of [999, 500, 0, -10, NaN, Infinity, "12.345", "abc"]) {
      const result = schema.safeParse({
        amount,
        email: "a@b.com",
        phone: "9876543210",
      });
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

  it("builds dual v1/v2 consent hash when two salts differ", () => {
    const si = serializeSiDetails({
      billingAmount: "500.00",
      billingCurrency: "INR",
      billingCycle: "MONTHLY",
      billingInterval: 1,
      paymentStartDate: "2026-09-22",
      paymentEndDate: "2036-09-22",
    });

    const hash = generateConsentHash({
      key: "Xc6sck",
      saltV1: "salt-version-one",
      saltV2: "salt-version-two-xxxxxxxx",
      useDualHash: true,
      txnid: "mmucc8l8nc01b6d4f",
      amount: "500.00",
      productinfo: "Shikshantar monthly donation",
      firstname: "Dhiraj joshi",
      email: "dhirajj220@gmail.com",
      siDetailsJson: si,
    });

    const parsed = JSON.parse(hash) as { v1: string; v2: string };
    expect(parsed.v1).toHaveLength(128);
    expect(parsed.v2).toHaveLength(128);
    expect(parsed.v1).not.toEqual(parsed.v2);
  });

  it("builds plain hex hash for live single-salt accounts", () => {
    const si = serializeSiDetails({
      billingAmount: "500.00",
      billingCurrency: "INR",
      billingCycle: "MONTHLY",
      billingInterval: 1,
      paymentStartDate: "2026-09-22",
      paymentEndDate: "2036-09-22",
    });

    const hash = generateConsentHash({
      key: "Xc6sck",
      saltV1: "EI7q4HeCYMQyXhhtymmooCGaTLLeB0tt",
      txnid: "mmucc8l8nc01b6d4f",
      amount: "500.00",
      productinfo: "Shikshantar monthly donation",
      firstname: "Dhiraj joshi",
      email: "dhirajj220@gmail.com",
      siDetailsJson: si,
    });

    expect(hash.startsWith("{")).toBe(false);
    expect(hash).toBe(
      "f2e731ee5fd480f90af2dfd46b5e7263f5ef8db8b67554a081d93319ae86d7745c636450041bc1b3467b9c23e0fd4523646146c05f08106f0073f32afaf99c97",
    );
  });

  it("matches PayU-reported v1 for known fixture (dual mode)", () => {
    const si = serializeSiDetails({
      billingAmount: "500.00",
      billingCurrency: "INR",
      billingCycle: "MONTHLY",
      billingInterval: 1,
      paymentStartDate: "2026-09-22",
      paymentEndDate: "2036-09-22",
    });

    const hash = generateConsentHash({
      key: "Xc6sck",
      saltV1: "EI7q4HeCYMQyXhhtymmooCGaTLLeB0tt",
      saltV2: "other-256-bit-salt",
      useDualHash: true,
      txnid: "mmucc8l8nc01b6d4f",
      amount: "500.00",
      productinfo: "Shikshantar monthly donation",
      firstname: "Dhiraj joshi",
      email: "dhirajj220@gmail.com",
      siDetailsJson: si,
    });

    const parsed = JSON.parse(hash) as { v1: string };
    expect(parsed.v1).toBe(
      "f2e731ee5fd480f90af2dfd46b5e7263f5ef8db8b67554a081d93319ae86d7745c636450041bc1b3467b9c23e0fd4523646146c05f08106f0073f32afaf99c97",
    );
  });

  it("verifies reverse hash for plain and JSON forms", () => {
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
    const hex = generateReverseHash({
      salt,
      key,
      status: body.status,
      email: body.email,
      firstname: body.firstname,
      productinfo: body.productinfo,
      amount: body.amount,
      txnid: body.txnid,
    });
    expect(verifyReverseHash({ ...body, hash: hex }, salt, key)).toBe(true);
    expect(
      verifyReverseHash(
        { ...body, hash: JSON.stringify({ v1: hex, v2: "deadbeef" }) },
        [salt, "other"],
        key,
      ),
    ).toBe(true);
    expect(verifyReverseHash({ ...body, hash: "deadbeef" }, salt, key)).toBe(
      false,
    );
  });
});
