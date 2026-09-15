import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export const WHATSAPP_JOIN_URL =
  "https://wa.me/919820700455?text=Hi%20Shikshantar%2C%20I%27d%20like%20to%20join%20the%20weekly%20broadcast%20%2F%20volunteer.";

export const WHATSAPP_DISPLAY = "+91 98207 00455";

export default function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="site-shell footer-top">
        <div className="footer-brand">
          <Link to="/" className="brand brand-footer">
            <img
              src="/Shikshantar Logo Horizontal.png"
              alt="Shikshantar"
              className="footer-logo"
            />
          </Link>
          <p>
            Nurturing Mumbai&apos;s migrant children into confident, employable citizens.
            <br />
            107, Crystal Centre, Raheja Vihar, Powai, Mumbai – 72.
          </p>
          <div className="footer-contact-lines">
            <a href="mailto:hello@myshiksha.org">hello@myshiksha.org</a>
            <a href="tel:+919820700455">98207 00455</a>
          </div>
          <div className="social-links">
            <a
              href="https://www.instagram.com/shikshantar_powai/"
              target="_blank"
              rel="noreferrer"
              aria-label="Shikshantar on Instagram"
            >
              <span className="social-word">ig</span>
            </a>
            <a
              href={WHATSAPP_JOIN_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Message Shikshantar on WhatsApp"
              className="social-whatsapp"
            >
              <span className="social-word">wa</span>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <span className="footer-heading">Explore</span>
            <Link to="/about">Our journey</Link>
            <Link to="/#impact">Our impact</Link>
          </div>
          <div>
            <span className="footer-heading">Join in</span>
            <Link to="/#give">Give monthly</Link>
            <a href={WHATSAPP_JOIN_URL} target="_blank" rel="noreferrer">
              Volunteer / mentor
            </a>
            <a href={WHATSAPP_JOIN_URL} target="_blank" rel="noreferrer">
              Weekly broadcast
            </a>
          </div>

          <div id="join" className="footer-join">
            <span className="footer-heading">Scan to join</span>
            <p>WhatsApp us to volunteer or join the weekly parent broadcast.</p>
            <a
              href={WHATSAPP_JOIN_URL}
              target="_blank"
              rel="noreferrer"
              className="footer-qr-link"
              aria-label="Open WhatsApp to join Shikshantar"
            >
              <img
                src="/whatsapp-join-qr.svg"
                alt={`QR code linking to WhatsApp ${WHATSAPP_DISPLAY}`}
                className="footer-qr"
                width={132}
                height={132}
              />
            </a>
            <a
              href={WHATSAPP_JOIN_URL}
              target="_blank"
              rel="noreferrer"
              className="footer-whatsapp-cta"
            >
              Message {WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="site-shell footer-bottom-inner">
          <span>© 2024 Shikshantar Foundation</span>
          <span className="footer-bottom-links">
            <Link to="/#contact">Privacy</Link>
            <span className="footer-location">
              <MapPin size={13} /> Crystal Centre · Powai · Mumbai
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
