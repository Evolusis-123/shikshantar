import { FormEvent, useEffect, useId, useState } from "react";
import { Heart, LoaderCircle, X } from "lucide-react";
import { PAYU_1000, PAYU_500, PAYU_CUSTOM } from "@/lib/payments";
import { MIN_MONTHLY_DONATION_INR } from "@shared/donations";

type Mode = "onetime" | "monthly";
type AmountChoice = 500 | 1000 | "custom";

function isValidInrAmount(raw: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(raw.trim());
}

function startMonthlyCheckout(payload: {
  amount: number;
  name?: string;
  email: string;
  phone: string;
}) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/donations/monthly/redirect";
  form.style.display = "none";

  const fields: Record<string, string> = {
    amount: String(payload.amount),
    email: payload.email,
    phone: payload.phone,
  };
  if (payload.name) fields.name = payload.name;

  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export default function DonationBox() {
  const titleId = useId();
  const [mode, setMode] = useState<Mode>("onetime");
  const [amountChoice, setAmountChoice] = useState<AmountChoice>(500);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const resolvedAmount =
    amountChoice === "custom" ? Number(customAmount) : amountChoice;

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  function validateAmount(): string | null {
    // One-time custom uses PayU's hosted payment page (amount chosen there).
    if (mode === "onetime" && amountChoice === "custom") return null;

    if (amountChoice === "custom") {
      const raw = customAmount.trim();
      if (!raw || !isValidInrAmount(raw)) {
        return "Enter a valid amount in rupees (up to 2 decimals).";
      }
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) {
        return "Enter a valid donation amount.";
      }
      if (mode === "monthly" && value < MIN_MONTHLY_DONATION_INR) {
        return `Minimum monthly donation is ₹${MIN_MONTHLY_DONATION_INR}.`;
      }
    }
    return null;
  }

  function onPrimaryClick() {
    setError(null);
    const amountError = validateAmount();
    if (amountError) {
      setError(amountError);
      return;
    }

    if (mode === "onetime") {
      const href =
        amountChoice === 500
          ? PAYU_500
          : amountChoice === 1000
            ? PAYU_1000
            : PAYU_CUSTOM;
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    setModalOpen(true);
  }

  function onMonthlySubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const amountError = validateAmount();
    if (amountError) {
      setError(amountError);
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setSubmitting(true);
    startMonthlyCheckout({
      amount: resolvedAmount,
      name: name.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
    });
  }

  return (
    <>
      <div id="donate" className="donation-box">
        <div className="donation-box-head">
          <span className="donation-box-eyebrow">Give with heart</span>
          <h3>Support a child today</h3>
          <p>Choose one-time or monthly, then pick an amount.</p>
        </div>

        <div className="donation-mode" role="group" aria-label="Donation type">
          <button
            type="button"
            className={`donation-mode-btn${mode === "onetime" ? " is-active" : ""}`}
            onClick={() => {
              setMode("onetime");
              setError(null);
            }}
          >
            One-time
          </button>
          <button
            type="button"
            className={`donation-mode-btn${mode === "monthly" ? " is-active" : ""}`}
            onClick={() => {
              setMode("monthly");
              setError(null);
            }}
          >
            Monthly
          </button>
        </div>

        <div className="donation-amounts" role="group" aria-label="Donation amount">
          <button
            type="button"
            className={`donation-amount-btn${amountChoice === 500 ? " is-active" : ""}`}
            onClick={() => {
              setAmountChoice(500);
              setError(null);
            }}
          >
            ₹500
          </button>
          <button
            type="button"
            className={`donation-amount-btn${amountChoice === 1000 ? " is-active" : ""}`}
            onClick={() => {
              setAmountChoice(1000);
              setError(null);
            }}
          >
            ₹1,000
          </button>
          <button
            type="button"
            className={`donation-amount-btn${amountChoice === "custom" ? " is-active" : ""}`}
            onClick={() => {
              setAmountChoice("custom");
              setError(null);
            }}
          >
            Custom
          </button>
        </div>

        {amountChoice === "custom" && mode === "monthly" && (
          <label className="donation-custom-field">
            <span>Amount (₹)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={`e.g. 750 (min ${MIN_MONTHLY_DONATION_INR})`}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setError(null);
              }}
            />
          </label>
        )}

        {amountChoice === "custom" && mode === "onetime" && (
          <p className="donation-note">You’ll choose any amount on the secure PayU page.</p>
        )}

        {mode === "monthly" && amountChoice !== "custom" && (
          <p className="donation-note">
            Monthly gifts renew via PayU AutoDebit. Minimum ₹{MIN_MONTHLY_DONATION_INR}.
          </p>
        )}

        {mode === "monthly" && amountChoice === "custom" && (
          <p className="donation-note">Monthly gifts renew via PayU AutoDebit.</p>
        )}

        {error && !modalOpen && (
          <p className="donation-error" role="alert">
            {error}
          </p>
        )}

        <button type="button" className="button button-primary donation-submit" onClick={onPrimaryClick}>
          <Heart size={16} fill="currentColor" />
          {mode === "onetime"
            ? amountChoice === "custom"
              ? "Donate Now · Custom"
              : `Donate Now · ₹${amountChoice.toLocaleString("en-IN")}`
            : amountChoice === "custom"
              ? Number.isFinite(resolvedAmount) && customAmount.trim()
                ? `Give Monthly · ₹${resolvedAmount.toLocaleString("en-IN")}`
                : "Give Monthly · Custom"
              : `Give Monthly · ₹${amountChoice.toLocaleString("en-IN")}`}
        </button>
      </div>

      {modalOpen && (
        <div className="donation-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="donation-modal-backdrop"
            aria-label="Close"
            onClick={() => !submitting && setModalOpen(false)}
          />
          <div className="donation-modal-panel">
            <div className="donation-modal-head">
              <div>
                <span className="donation-box-eyebrow">Monthly gift</span>
                <strong id={titleId}>
                  ₹{Number.isFinite(resolvedAmount) ? resolvedAmount.toLocaleString("en-IN") : "—"} / month
                </strong>
              </div>
              <button
                type="button"
                className="donation-modal-close"
                aria-label="Close dialog"
                disabled={submitting}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className="donation-modal-form" onSubmit={onMonthlySubmit}>
              <p>We’ll send these details to PayU to set up your monthly AutoDebit.</p>

              <label className="donation-custom-field">
                <span>Name (optional)</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                />
              </label>
              <label className="donation-custom-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  maxLength={50}
                />
              </label>
              <label className="donation-custom-field">
                <span>Phone</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                  maxLength={15}
                />
              </label>

              {error && (
                <p className="donation-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="button button-primary donation-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle size={16} className="donation-spinner" /> Redirecting to PayU…
                  </>
                ) : (
                  <>
                    <Heart size={16} fill="currentColor" /> Continue to PayU
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
