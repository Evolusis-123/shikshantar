import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Menu, Phone, X } from "lucide-react";
import { useJoinForm, VOLUNTEER_FORM_URL } from "@/components/JoinFormProvider";

type SiteHeaderProps = {
  /** Highlight the About/journey nav item when on /about */
  activePage?: "home" | "about";
};

export default function SiteHeader({ activePage = "home" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const openJoinForm = useJoinForm();

  const handleJoinClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    closeMenu();
    openJoinForm();
  };

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 960) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="utility-bar">
        <div className="site-shell utility-inner">
          <p className="hidden sm:block">Together, we can all make a difference.</p>
          <div className="utility-links">
            <a
              href="mailto:hello@myshiksha.org"
              className="hidden md:inline-flex items-center gap-2"
            >
              <Mail size={13} /> hello@myshiksha.org
            </a>
            <a
              href="tel:+919820700455"
              className="hidden md:inline-flex items-center gap-2"
            >
              <Phone size={13} /> 98207 00455
            </a>
            <span className="utility-divider" />
            <Link to="/#contact">Contact</Link>
            <a href={VOLUNTEER_FORM_URL} onClick={handleJoinClick}>
              Join
            </a>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="site-shell header-inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <img
              src="/Shikshantar Logo Horizontal.png"
              alt="Shikshantar"
              className="brand-logo"
            />
          </Link>

          <nav
            id="site-mobile-nav"
            className={`main-nav ${menuOpen ? "is-open" : ""}`}
            aria-label="Primary"
          >
            <Link to="/#about" onClick={closeMenu}>
              Our why
            </Link>
            <Link to="/#impact" onClick={closeMenu}>
              Impact
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className={activePage === "about" ? "is-active" : undefined}
            >
              Journey
            </Link>
            <a href={VOLUNTEER_FORM_URL} onClick={handleJoinClick}>
              Join us
            </a>
            <Link to="/#give" className="nav-mobile-cta" onClick={closeMenu}>
              Give hope
            </Link>
          </nav>

          <div className="header-actions">
            <Link to="/#give" className="button button-small button-yellow">
              <Heart size={15} fill="currentColor" /> Give hope
            </Link>
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
