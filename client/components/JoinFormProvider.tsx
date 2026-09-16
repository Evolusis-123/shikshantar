import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { HandHeart, X } from "lucide-react";

/** Public link to the volunteer / mentor form (used as new-tab fallback). */
export const VOLUNTEER_FORM_URL = "https://wkf.ms/4oS6PTM";

/** Embeddable variant of the same form — the short link cannot be framed. */
const VOLUNTEER_FORM_EMBED_URL =
  "https://forms.monday.com/forms/embed/0fff0b315df6d6977a1131a9fcf86987?r=use1";

const JoinFormContext = createContext<() => void>(() => {});

export const useJoinForm = () => useContext(JoinFormContext);

export default function JoinFormProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openForm = useCallback(() => setOpen(true), []);
  const closeForm = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <JoinFormContext.Provider value={openForm}>
      {children}

      <button
        type="button"
        className={`join-fab ${open ? "is-hidden" : ""}`}
        onClick={openForm}
        aria-label="Volunteer or mentor with us"
      >
        <span className="join-fab-icon">
          <HandHeart size={21} />
        </span>
        <span className="join-fab-text">Join us</span>
      </button>

      {open && (
        <div className="join-modal" role="dialog" aria-modal="true" aria-label="Volunteer and mentor form">
          <button type="button" className="join-modal-backdrop" onClick={closeForm} aria-label="Close form" />
          <div className="join-modal-panel">
            <div className="join-modal-head">
              <div>
                <span className="join-modal-eyebrow">Join Shikshantar</span>
                <strong>Volunteer / mentor with us</strong>
              </div>
              <button type="button" className="join-modal-close" onClick={closeForm} aria-label="Close form">
                <X size={20} />
              </button>
            </div>
            <iframe
              src={VOLUNTEER_FORM_EMBED_URL}
              title="Shikshantar volunteer and mentor form"
              className="join-modal-frame"
            />
            <a
              href={VOLUNTEER_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="join-modal-fallback"
            >
              Form not loading? Open it in a new tab
            </a>
          </div>
        </div>
      )}
    </JoinFormContext.Provider>
  );
}
