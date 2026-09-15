import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CloudRain,
  Heart,
  Home,
  MapPin,
  Trees,
} from "lucide-react";
import SiteFooter, { WHATSAPP_JOIN_URL } from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const teamMembers = [
  {
    name: "Indu Ahuja",
    image: "/indu_ahuja.jpg",
    bio: "A qualified high school teacher with over 30 years of experience. Beaming with energy and a heart full of love for the underprivileged, she is also a yoga practitioner.",
  },
  {
    name: "Radhika Mehtani",
    image: "/radhika.jpg",
    bio: "An MBA with over 20 years of corporate and teaching experience, Radhika now runs her own learning centre with 160+ students, alongside her contribution at Shikshantar.",
  },
  {
    name: "Abiali Shaikh",
    image: "/abiali_sheikh.jpg",
    bio: "A qualified business administrator, he runs his own IT startup. He believes in the importance of working with young students to bring forth long-term systemic change.",
  },
];

const journeyMilestones = [
  {
    year: "2021",
    title: "Journey start — outside the guard office",
    location: "Near the watchman cabin",
    story:
      "Indu Ahuja and Abiali began teaching students outdoors, beside the building near the watchman guard office. With little more than dedication and open space, the first classroom took shape under the sky.",
    image: "/security.jpg",
    icon: Trees,
  },
  {
    year: "2022",
    title: "Teaching in BMC Park, Powai",
    location: "Public park, Powai",
    story:
      "As more students joined, they moved near BMC Park in Powai and taught in the public park for about eight months. The classes went well — but the monsoon season brought hard days, rain, and constant struggle to keep learning going.",
    image: "/image-6.jpg",
    icon: CloudRain,
  },
  {
    year: "2024",
    title: "A floor of our own — Crystal Centre",
    location: "Chandivali, Mumbai",
    story:
      "They finally rented an entire floor at 107, Crystal Centre, Raheja Vihar, Chandivali, Mumbai – 400072. At last, students had a steady indoor space to learn, grow, and feel at home.",
    image: "/image-4.jpg",
    icon: Home,
  },
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

export default function About() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fffdf8] text-ink">
      <SiteHeader activePage="about" />

      <main>
        <section className="about-page-hero">
          <div className="about-hero-deco" aria-hidden="true">
            <span className="about-hero-dot about-hero-dot-tl" />
            <svg className="about-hero-shape about-hero-triangle" viewBox="0 0 120 110" fill="none">
              <path d="M8 98 L60 10 L112 98 Z" fill="currentColor" />
            </svg>
            <svg className="about-hero-shape about-hero-dashed" viewBox="0 0 80 220" fill="none">
              <path
                d="M18 210 C18 120 62 150 62 90 C62 35 22 45 22 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="7 8"
                strokeLinecap="round"
              />
            </svg>
            <svg className="about-hero-shape about-hero-arc" viewBox="0 0 140 80" fill="none">
              <path
                d="M10 60 C40 10 100 10 130 55"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="5 7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="site-shell about-hero-grid">
            <div className="about-hero-copy">
              <Reveal>
                <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> Our journey</div>
                <h1>
                  Built by people who believe every child deserves a chance to{" "}
                  <em>
                    rise
                    <svg className="hero-brush" viewBox="0 0 180 18" fill="none" aria-hidden="true">
                      <path
                        d="M4 11 C28 4 52 14 78 8 C104 2 128 13 152 7 C160 5 170 6 176 8"
                        stroke="currentColor"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </em>
                  .
                </h1>
                <p className="hero-lede">
                  From a patch of pavement beside a guard office to a full floor in Chandivali —
                  this is how Shikshantar found its home, one year at a time.
                </p>
              </Reveal>
            </div>

            <div className="about-hero-visual">
              <div className="about-hero-photo-wrap">
                <img
                  src="/about.jpg"
                  alt="Shikshantar mentors and children together"
                  className="about-hero-photo"
                />
                <div className="about-hero-photo-overlay" />
              </div>
              <div className="about-hero-scribble" aria-hidden="true">
                <svg viewBox="0 0 120 55" fill="none">
                  <path d="M4 44C31 9 64 9 113 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M97 3L114 9L102 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="about-hero-orbit" aria-hidden="true" />
              <div className="about-hero-orbit about-hero-orbit-b" aria-hidden="true" />
              <span className="about-hero-dot about-hero-dot-br" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section id="journey" className="journey-section">
          <div className="site-shell journey-shell">
            <Reveal className="journey-intro">
              <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> Timeline</div>
              <h2>How the classroom<br /><em>found its walls.</em></h2>
            </Reveal>

            <div className="journey-timeline">
              {journeyMilestones.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === journeyMilestones.length - 1;

                return (
                  <Reveal key={item.year}>
                    <article className={`journey-row${isLast ? " is-last" : ""}`}>
                      <div className="journey-row-media">
                        <img src={item.image} alt={item.title} />
                      </div>

                      <div className="journey-row-rail" aria-hidden="true">
                        <span className="journey-row-node">
                          <Icon size={14} strokeWidth={2.2} />
                        </span>
                        {!isLast && <span className="journey-row-line" />}
                      </div>

                      <div className="journey-row-copy">
                        <span className="journey-row-year">{item.year}</span>
                        <h3>{item.title}</h3>
                        <p>{item.story}</p>
                        <span className="journey-row-place"><MapPin size={14} /> {item.location}</span>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="team-section about-page-team">
          <div className="site-shell">
            <Reveal className="section-heading section-heading-centered">
              <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> Our people</div>
              <h2>Meet the hearts<br /><em>behind the work.</em></h2>
            </Reveal>
            <div className="team-grid team-grid-static">
              {teamMembers.map((member) => (
                <Reveal key={member.name} className="team-card">
                  <div className="team-photo-wrap">
                    <img src={member.image} alt={member.name} className="team-photo" />
                  </div>
                  <h3>{member.name}</h3>
                  <p>{member.bio}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="about-page-cta">
          <div className="site-shell about-page-cta-inner">
            <Reveal>
              <h2>Ready to walk this journey with us?</h2>
              <p>Volunteer, mentor, or join our weekly WhatsApp broadcast — we&apos;d love to hear from you.</p>
              <div className="about-page-cta-actions">
                <Link to="/#give" className="button button-primary">Give with love <Heart size={15} fill="currentColor" /></Link>
                <a href={WHATSAPP_JOIN_URL} target="_blank" rel="noreferrer" className="text-link text-link-dark">
                  Message on WhatsApp <ArrowRight size={16} />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
