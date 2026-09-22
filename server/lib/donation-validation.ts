import { z } from "zod";
import { MIN_MONTHLY_DONATION_INR } from "../../shared/donations";

const INR_AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

export function createMonthlyDonationSchema(maxAmount: number) {
  return z
    .object({
      amount: z.union([z.number(), z.string()]),
      name: z.string().trim().max(60).optional(),
      email: z.string().trim().email().max(50).optional(),
      phone: z
        .string()
        .trim()
        .regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number")
        .optional(),
    })
    .superRefine((data, ctx) => {
      const raw = data.amount;
      const asString =
        typeof raw === "number" ? String(raw) : String(raw ?? "").trim();

      if (
        asString === "" ||
        asString.toLowerCase() === "nan" ||
        asString.toLowerCase() === "infinity" ||
        asString.toLowerCase() === "-infinity"
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Enter a valid donation amount",
        });
        return;
      }

      if (!INR_AMOUNT_REGEX.test(asString)) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount must be a valid INR value (up to 2 decimals)",
        });
        return;
      }

      const value = Number(asString);
      if (!Number.isFinite(value)) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Enter a valid donation amount",
        });
        return;
      }
      if (value <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount must be greater than zero",
        });
        return;
      }
      if (value < MIN_MONTHLY_DONATION_INR) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: `Minimum monthly donation is ₹${MIN_MONTHLY_DONATION_INR}`,
        });
        return;
      }
      if (value > maxAmount) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: `Maximum monthly donation is ₹${maxAmount.toLocaleString("en-IN")}`,
        });
      }
    })
    .transform((data) => {
      const amount = Number(Number(data.amount).toFixed(2));
      const name = sanitizePersonName(data.name) || "Donor";
      const email = (data.email || "donor@myshiksha.org").toLowerCase();
      const phone = sanitizePhone(data.phone) || "9999999999";

      return { amount, name, email, phone };
    });
}

function sanitizePersonName(value?: string): string {
  if (!value) return "";
  return value
    .replace(/[^A-Za-z0-9 @._\-]/g, "")
    .trim()
    .slice(0, 60);
}

function sanitizePhone(value?: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  return digits.slice(-10) || digits;
}
