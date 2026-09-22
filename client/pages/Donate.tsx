import { FormEvent, useState } from "react";
import { Heart, LoaderCircle } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { PAYU_1000, PAYU_CUSTOM } from "@/lib/payments";
import {
  MIN_MONTHLY_DONATION_INR,
  type MonthlyDonationCheckoutResponse,
} from "@shared/donations";

const MONTHLY_PRESETS = [500, 1000, 2500] as const;

function isValidInrAmount(raw: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(raw.trim());
}

function submitPayUForm(checkout: MonthlyDonationCheckoutResponse) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkout.paymentUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(checkout.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export default function Donate() {
  const [preset, setPreset] = useState<number | "custom">(500);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedAmount =
    preset === "custom" ? Number(customAmount) : preset;

  function validateClient(): string | null {
    if (preset === "custom") {
      const raw = customAmount.trim();
      if (!raw || !isValidInrAmount(raw)) {
        return "Enter a valid amount in rupees (up to 2 decimals).";
      }
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) {
        return "Enter a valid donation amount.";
      }
      if (value < MIN_MONTHLY_DONATION_INR) {
        return `Minimum monthly donation is ₹${MIN_MONTHLY_DONATION_INR}.`;
      }
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return "Please enter a valid 10-digit phone number.";
    }
    return null;
  }

  async function onGiveMonthly(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const clientError = validateClient();
    if (clientError) {
      setError(clientError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/donations/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          name: name.trim() || undefined,
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = (await response.json()) as
        | MonthlyDonationCheckoutResponse
        | { error?: string };

      if (!response.ok || !("fields" in data) || !data.fields) {
        setError(
          ("error" in data && data.error) ||
            "Unable to start checkout. Please try again.",
        );
        setSubmitting(false);
        return;
      }

      submitPayUForm(data);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page-root donate-page">
      <SiteHeader />
      <main>
        <section className="donate-hero">
          <div className="site-shell donate-hero-inner">
            <div className="eyebrow eyebrow-dark">
              <span className="eyebrow-dot" /> Support our work
            </div>
            <h1>
              Support Us <em>Monthly</em>
            </h1>
            <p>
              Choose an amount you would like to contribute every month — or give
              once. Your gift helps Mumbai&apos;s under-served students learn with
              dignity.
            </p>
          </div>
        </section>

        <section className="section donate-section">
          <div className="site-shell donate-layout">
            <div className="donate-panel">
              <h2>One-time donation</h2>
              <p>Pay securely on PayU with a one-time gift.</p>
              <div className="donate-one-time-actions">
                <a
                  href={PAYU_CUSTOM}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-primary"
                >
                  Donate any amount
                </a>
                <a
                  href={PAYU_1000}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-dark"
                >
                  Donate ₹1,000
                </a>
              </div>
            </div>

            <form className="donate-panel donate-monthly" onSubmit={onGiveMonthly}>
              <h2>Monthly donation</h2>
              <p>
                Choose an amount you would like to contribute every month.
                Minimum monthly donation: ₹{MIN_MONTHLY_DONATION_INR}.
              </p>

              <div className="donate-presets" role="group" aria-label="Monthly amount presets">
                {MONTHLY_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`donate-preset${preset === value ? " is-active" : ""}`}
                    onClick={() => {
                      setPreset(value);
                      setError(null);
                    }}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
                <button
                  type="button"
                  className={`donate-preset${preset === "custom" ? " is-active" : ""}`}
                  onClick={() => {
                    setPreset("custom");
                    setError(null);
                  }}
                >
                  Custom
                </button>
              </div>

              {preset === "custom" && (
                <label className="donate-field">
                  <span>Custom amount (₹)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 750"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setError(null);
                    }}
                    aria-label="Custom monthly amount in rupees"
                  />
                </label>
              )}

              <div className="donate-donor-fields">
                <label className="donate-field">
                  <span>Name (optional)</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                  />
                </label>
                <label className="donate-field">
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={50}
                  />
                </label>
                <label className="donate-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={15}
                  />
                </label>
              </div>

              {error && (
                <p className="donate-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="button button-primary donate-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={16} className="donate-spinner" /> Redirecting to PayU…
                  </>
                ) : (
                  <>
                    <Heart size={16} fill="currentColor" /> Give Monthly
                    {Number.isFinite(selectedAmount) && selectedAmount >= MIN_MONTHLY_DONATION_INR
                      ? ` · ₹${Number(selectedAmount).toLocaleString("en-IN")}`
                      : ""}
                  </>
                )}
              </button>

              <p className="donate-note">
                You&apos;ll pay ₹
                {Number.isFinite(selectedAmount) && selectedAmount >= MIN_MONTHLY_DONATION_INR
                  ? Number(selectedAmount).toLocaleString("en-IN")
                  : "—"}{" "}
                now on PayU, and the same amount will renew monthly via AutoDebit
                (UPI / card / eNACH as enabled for our account).
              </p>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
