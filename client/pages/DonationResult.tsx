import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

type ResultKind = "success" | "failed";

export default function DonationResult({ kind }: { kind: ResultKind }) {
  const [params] = useSearchParams();
  const location = useLocation();
  const txnid = params.get("txnid") || "";
  const amount = params.get("amount") || "";
  const mandate = params.get("mandate");
  const reason = params.get("reason");

  const isSuccess = kind === "success";

  return (
    <div className="page-root donate-result-page">
      <SiteHeader />
      <main>
        <section className="section donate-result-section">
          <div className="site-shell donate-result-card">
            {isSuccess ? (
              <CheckCircle2 size={48} className="donate-result-icon is-success" aria-hidden />
            ) : (
              <XCircle size={48} className="donate-result-icon is-failed" aria-hidden />
            )}

            <h1>{isSuccess ? "Thank you for giving." : "Donation not completed."}</h1>

            {isSuccess ? (
              <p>
                Your payment was received
                {amount ? ` (₹${amount})` : ""}.
                {mandate === "1"
                  ? " Your monthly AutoDebit mandate was registered successfully."
                  : " If you set up AutoDebit, PayU will confirm the mandate separately."}
              </p>
            ) : (
              <p>
                {reason === "invalid"
                  ? "We could not verify the payment response. If money was deducted, it will be reconciled by PayU — please contact us with your reference."
                  : "The payment was cancelled or could not be completed. No monthly mandate was set up."}
              </p>
            )}

            {txnid && (
              <p className="donate-result-ref">
                Reference: <code>{txnid}</code>
              </p>
            )}

            <div className="donate-result-actions">
              {isSuccess ? (
                <Link to="/" className="button button-primary">
                  Back home <ArrowRight size={16} />
                </Link>
              ) : (
                <Link to="/#donate" className="button button-primary">
                  Try again <ArrowRight size={16} />
                </Link>
              )}
              <Link to="/#contact" className="text-link text-link-dark">
                Contact us
              </Link>
            </div>

            <span className="sr-only">{location.pathname}</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
