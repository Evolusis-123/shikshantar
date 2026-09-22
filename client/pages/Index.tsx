import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  GraduationCap,
  HandHeart,
  Heart,
  MessageCircle,
  Music2,
  Play,
  Sparkles,
  Tablet,
} from "lucide-react";
import GlareHover from "@/components/animations/GlareHover";
import GradientText from "@/components/animations/GradientText";
import StarBorder from "@/components/animations/StarBorder";
import RealityChart from "@/components/RealityChart";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import DonationBox from "@/components/DonationBox";

const imageUrls = {
  hero: "/image-2.jpg",
  classroom: "/image-4.jpg",
  community: "/image-6.jpg",
  aboutMain: "/image-1.jpg",
  aboutInset: "/image-3.jpg",
};

const aboutFeatures = [
  {
    title: "English, maths, arts & coding.",
    description: "Mon–Sat learning at our Powai centre for under-served students between the ages of 5–15.",
  },
  {
    title: "Mentors who show up.",
    description: "Hundreds of children, fifteen mentors, and full-time staff working to close the learning gap.",
  },
];

const coverageItems = [
  {
    title: "Dance",
    description: "Dedicated dance instructors.",
    icon: Music2,
  },
  {
    title: "Focused Grade Wise Studying",
    description: "Grade-appropriate learning groups.",
    icon: GraduationCap,
  },
  {
    title: "Personalised Curriculum",
    description: "No one size fits all approach.",
    icon: ClipboardList,
  },
  {
    title: "360 Degree Support",
    description: "WhatsApp groups, parent involvement.",
    icon: MessageCircle,
  },
  {
    title: "Technology Enabled",
    description: "Tablets etc. are used to facilitate learning.",
    icon: Tablet,
  },
];

const teamMembers = [
    {
    name: "Indu Ahuja",
    image: "/indu_ahuja.jpg",
    bio: "A qualified high school teacher with over 30 years of experience. Beaming with energy and a heart full of love for the underprivileged, she is also a yoga practitioner.",
  },
  {
    name: "Radhika Mehtani",
    image: "/radhika.jpg",
    bio: "An MBA with over 20 years of corporate and teaching experience, Radhika now runs her own learning centre with 250+ students, alongside her contribution at Shikshantar.",
  },
  {
    name: "Abiali Shaikh",
    image: "/abiali_sheikh.jpg",
    bio: "A qualified business administrator, he runs his own IT startup. He believes in the importance of working with young students to bring forth long-term systemic change.",
  },
];

const testimonials = [
  {
    name: "Akanksha Kakade",
    role: "VP — Morgan Stanley",
    quote:
      "I can’t imagine my week without spending time with these amazing kids. It’s fulfilling to be a small part of their journey.",
  },
  {
    name: "Meher Mehtani",
    role: "BSW student, Tata Institute of Social Sciences, Mumbai",
    quote:
      "Being a mentor to these kids is pure joy. Seeing their smiles and enthusiasm during our sessions warms my heart. It’s a simple act that makes a big difference in their lives.",
  },
  {
    name: "Diksha",
    role: "B.Com student",
    quote:
      "I signed up as a mentor thinking I had something to offer. Little did I know how much these kids would teach me about resilience and positivity. It’s a two-way street of learning and growth.",
  },
];

function Reveal({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`reveal ${className}`} style={style}>{children}</div>;
}

export default function Index() {
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
      <SiteHeader activePage="home" />

      <main>
        <section className="hero-section">
          <div className="hero-deco" aria-hidden="true">
            <span className="hero-dot hero-dot-tl" />
            <svg className="hero-shape hero-triangle" viewBox="0 0 120 110" fill="none">
              <path d="M8 98 L60 10 L112 98 Z" fill="currentColor" />
            </svg>
            <svg className="hero-shape hero-dashed-loop" viewBox="0 0 80 220" fill="none">
              <path
                d="M18 210 C18 120 62 150 62 90 C62 35 22 45 22 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="7 8"
                strokeLinecap="round"
              />
            </svg>
            <svg className="hero-shape hero-play-mark" viewBox="0 0 140 140" fill="none">
              <path d="M28 18 L122 70 L28 122 Z" fill="currentColor" />
            </svg>
          </div>

          <div className="site-shell hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> A better beginning is possible</div>
              <h1>
                Every child deserves a{" "}
                <em>
                  safe place
                  <svg className="hero-brush" viewBox="0 0 180 18" fill="none" aria-hidden="true">
                    <path
                      d="M4 11 C28 4 52 14 78 8 C104 2 128 13 152 7 C160 5 170 6 176 8"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                </em>{" "}
                to grow.
              </h1>
              <p className="hero-lede">Nurturing Mumbai&apos;s under-served students into confident, employable citizens through education and mentorship.</p>
              <div className="hero-actions">
                <div className="hero-cta-wrap">
                  <Link to="/#donate" className="button button-primary">Donate Now <ArrowUpRight size={17} /></Link>
                  <svg className="hero-cta-arrow" viewBox="0 0 160 70" fill="none" aria-hidden="true">
                    <path
                      d="M8 8 C48 58 96 62 138 34"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="6 7"
                      strokeLinecap="round"
                    />
                    <path d="M126 24 L142 34 L128 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <a
                  href="https://www.instagram.com/shikshantar_powai/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  <span className="play-icon"><Play size={11} fill="currentColor" /></span> See how we help
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-photo-wrap">
                <img src={imageUrls.hero} alt="Children learning together in class, hands raised" className="hero-photo" />
                <div className="hero-photo-overlay" />
              </div>
              <div className="hero-sticker"><Sparkles size={17} /><span>Hope<br /><strong>starts here</strong></span></div>
              <div className="hero-scribble" aria-hidden="true">
                <svg viewBox="0 0 120 55" fill="none">
                  <path d="M4 44C31 9 64 9 113 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M97 3L114 9L102 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
              <span className="hero-dot hero-dot-visual" aria-hidden="true" />
            </div>
          </div>
        </section>

        <div className="yellow-marquee" aria-hidden="true">
          <div className="marquee-track"><span>care <b>✦</b> learn <b>✦</b> belong <b>✦</b> thrive <b>✦</b> care <b>✦</b> learn <b>✦</b> belong <b>✦</b> thrive <b>✦</b></span><span>care <b>✦</b> learn <b>✦</b> belong <b>✦</b> thrive <b>✦</b> care <b>✦</b> learn <b>✦</b> belong <b>✦</b> thrive <b>✦</b></span></div>
        </div>

        <section id="about" className="section section-support">
          <div className="site-shell support-layout">
            <Reveal className="support-intro">
              <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> The heart of Shikshantar</div>
              <h2>Small gifts.<br /><em>Big beginnings.</em></h2>
              <p>When children have the basics — a safe home, a full belly, a chance to learn — they can begin to imagine more. Your kindness makes that first step possible.</p>
            </Reveal>
            <Reveal className="support-donate-wrap">
              <DonationBox />
            </Reveal>
          </div>
        </section>

        <section id="about-us" className="about-sopot-section">
          <div className="site-shell about-sopot-grid">
            <Reveal className="about-sopot-media">
              <span className="about-frame-accent" aria-hidden="true" />
              <span className="about-bar-stack" aria-hidden="true">
                <span /><span /><span />
              </span>
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderColor="transparent"
                borderRadius="0"
                glareColor="#ffffff"
                glareOpacity={0.45}
                glareSize={280}
                className="about-main-glare"
              >
                <img src={imageUrls.aboutMain} alt="Children showing their artwork and tattoos" className="about-main-image" />
              </GlareHover>
              <div className="about-inset-wrap">
                <GlareHover
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderColor="transparent"
                  borderRadius="0"
                  glareColor="#ffffff"
                  glareOpacity={0.4}
                  glareSize={260}
                  className="about-inset-glare"
                >
                  <img src={imageUrls.aboutInset} alt="Mentor reading with a child" className="about-inset-image" />
                </GlareHover>
              </div>
            </Reveal>

            <Reveal className="about-sopot-copy">
              <div className="about-sopot-panel">
                <span className="about-sopot-label">About us</span>
                <h2 className="about-sopot-title">
                  <GradientText
                    colors={["#ffffff", "#f8e34b", "#ffffff", "#ffe9a0"]}
                    animationSpeed={6}
                    className="about-gradient-title"
                  >
                    We Can Save More lives With Your Helping Hand.
                  </GradientText>
                </h2>
                <p>
                  Shikshantar brings people, practical care, and possibility together so children can grow up feeling safe,
                  seen, and ready for what comes next — one community at a time.
                </p>
                <ul className="about-feature-list">
                  {aboutFeatures.map((feature) => (
                    <li key={feature.title}>
                      <span className="about-check"><Check size={14} strokeWidth={3} /></span>
                      <div>
                        <strong>{feature.title}</strong>
                        <span>{feature.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="about-sopot-actions">
                  <StarBorder
                    as={Link}
                    to="/#impact"
                    className="about-star-btn"
                    color="#ffe9a0"
                    speed="5s"
                    thickness={2}
                    backgroundColor="#f8e34b"
                    textColor="#1e2a4a"
                    borderColor="#f8e34b"
                  >
                    <GlareHover
                      width="100%"
                      height="100%"
                      background="transparent"
                      borderColor="transparent"
                      borderRadius="6px"
                      glareColor="#ffffff"
                      glareOpacity={0.55}
                      glareSize={220}
                      transitionDuration={550}
                      className="about-btn-glare"
                    >
                      More
                    </GlareHover>
                  </StarBorder>
                  <a href="/about" className="about-play-btn" aria-label="Explore our journey">
                    <GlareHover
                      width="44px"
                      height="44px"
                      background="#1e2a4a"
                      borderColor="transparent"
                      borderRadius="50%"
                      glareColor="#ffffff"
                      glareOpacity={0.5}
                      glareSize={200}
                      className="about-play-glare"
                    >
                      <Play size={14} fill="currentColor" />
                    </GlareHover>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="reality" className="reality-section">
          <div className="reality-deco" aria-hidden="true">
            <svg className="reality-sun" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="12" fill="#f8e34b" />
              <path
                d="M32 6v8M32 50v8M6 32h8M50 32h8M14 14l5.5 5.5M44.5 44.5L50 50M50 14l-5.5 5.5M14 50l5.5-5.5"
                stroke="#f8e34b"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <svg className="reality-cloud" viewBox="0 0 90 48" fill="none">
              <path
                d="M22 36c-8 0-14-5-14-12s6-12 14-12c1.2-7 7-12 14.5-12 8.5 0 15 6.5 15.5 14.5 6 .5 11 5.5 11 11.5 0 6.5-5.5 10-12 10H22z"
                fill="#d86382"
                opacity=".22"
              />
            </svg>
            <svg className="reality-shape reality-star" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4 L28.5 17.5 L42 18 L31.5 27 L35 41 L24 33.5 L13 41 L16.5 27 L6 18 L19.5 17.5 Z"
                fill="currentColor"
              />
            </svg>
            <svg className="reality-shape reality-triangle" viewBox="0 0 64 58" fill="none">
              <path d="M6 52 L32 6 L58 52 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none" />
            </svg>
            <svg className="reality-shape reality-ring" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
              <circle cx="32" cy="32" r="10" fill="currentColor" opacity=".35" />
            </svg>
            <svg className="reality-shape reality-squiggle" viewBox="0 0 100 40" fill="none">
              <path
                d="M4 28 C18 8 32 8 46 22 C60 36 74 36 96 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="reality-dot reality-dot-a" />
            <span className="reality-dot reality-dot-b" />
            <span className="reality-dot reality-dot-c" />
          </div>

          <div className="site-shell">
            <Reveal className="reality-heading">
              <div className="eyebrow"><span className="eyebrow-dot" /> Why this work matters</div>
              <h2>Widening Gap</h2>
            </Reveal>

            <div className="reality-layout">
              <Reveal className="reality-chart-card">
                <RealityChart />
              </Reveal>

              <div className="reality-callouts">
                <Reveal className="reality-callout reality-callout-wef">
                  <span className="reality-callout-wef-logo">
                    <img src="/wef-logo.png" alt="World Economic Forum" />
                  </span>
                  <p>
                  Among underserved children, only <strong> 5 out of 100 </strong> reach higher education, and only <strong> 8 out of 100 </strong> land a skilled job. By adulthood, the gap has grown too wide for them to close alone.
                  </p>
                </Reveal>
                <Reveal className="reality-callout reality-callout-study" style={{ animationDelay: "100ms" } as React.CSSProperties}>
                  <div className="reality-callout-brand">
                    <img src="/shikshantar-mark.png" alt="" className="reality-callout-logo" />
                    <span>Our own study</span>
                  </div>
                  <p>
                    Children from migrant backgrounds are on average{" "}
                    <strong>3 full grades</strong> behind their counterparts.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section id="impact" className="section impact-section">
          <div className="impact-deco" aria-hidden="true">
            <span className="impact-dot impact-dot-a" />
            <span className="impact-dot impact-dot-b" />
            <svg className="impact-shape impact-triangle" viewBox="0 0 64 58" fill="none">
              <path d="M6 52 L32 6 L58 52 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <svg className="impact-shape impact-star" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4 L28.5 17.5 L42 18 L31.5 27 L35 41 L24 33.5 L13 41 L16.5 27 L6 18 L19.5 17.5 Z"
                fill="currentColor"
              />
            </svg>
            <svg className="impact-shape impact-squiggle" viewBox="0 0 100 40" fill="none">
              <path
                d="M4 28 C18 8 32 8 46 22 C60 36 74 36 96 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <svg className="impact-shape impact-arc" viewBox="0 0 160 60" fill="none">
              <path
                d="M6 52 C34 8 96 8 150 38"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="7 8"
                strokeLinecap="round"
              />
              <path d="M137 28 L152 39 L136 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg className="impact-shape impact-ring" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
              <circle cx="32" cy="32" r="10" fill="currentColor" opacity=".35" />
            </svg>
          </div>

          <div className="site-shell">
            <Reveal className="impact-heading">
              <h2>
                What all we{" "}
                <em>
                  cover
                  <svg className="impact-brush" viewBox="0 0 180 18" fill="none" aria-hidden="true">
                    <path
                      d="M4 11 C28 4 52 14 78 8 C104 2 128 13 152 7 C160 5 170 6 176 8"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                </em>{" "}
                <span className="impact-heading-tail">for every child</span>
              </h2>
            </Reveal>

            <div className="impact-split">
              <Reveal className="impact-media">
                <img
                  src={imageUrls.community}
                  alt="Children gathered outdoors for a learning activity"
                  className="impact-photo"
                />
              </Reveal>

              <div className="impact-metrics">
                {coverageItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Reveal
                      key={item.title}
                      className="impact-card"
                      style={{ animationDelay: `${index * 90}ms` } as React.CSSProperties}
                    >
                      <span className="impact-card-icon"><Icon size={22} strokeWidth={1.7} /></span>
                      <div className="impact-card-body">
                        <strong className="impact-card-value">{item.title}</strong>
                        <p className="impact-card-label">{item.description}</p>
                      </div>
                    </Reveal>
                  );
                })}
                <Reveal className="impact-cta">
                  <Link to="/#donate" className="button button-primary">
                    Donate Now <ArrowUpRight size={16} />
                  </Link>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="team-section">
          <div className="team-yellow-top">
            <div className="site-shell team-heading">
              <Reveal>
                <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> About us</div>
                <h2>The people behind<br /><em>Shikshantar.</em></h2>
              </Reveal>
              <Reveal>
                <Link to="/about" className="button button-dark">
                  Explore our Journey <ArrowUpRight size={16} />
                </Link>
              </Reveal>
            </div>
          </div>

          <div className="site-shell team-grid-wrap">
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <Reveal
                  key={member.name}
                  className="team-card"
                  style={{ animationDelay: `${index * 110}ms` } as React.CSSProperties}
                >
                  <div className="team-photo-wrap">
                    <img src={member.image} alt={member.name} className="team-photo" />
                  </div>
                  <h3>{member.name}</h3>
                  <p>{member.bio}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="team-cta-mobile">
              <Link to="/about" className="button button-primary">
                Explore our Journey <ArrowUpRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>

        <section id="testimonials" className="section testimonial-section">
          <div className="site-shell">
            <Reveal className="section-heading section-heading-centered testimonial-heading">
              <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> In their words</div>
              <h2>Mentor&apos;s <em> testimonials.</em></h2>
            </Reveal>

            <div className="testimonial-grid">
              {testimonials.map((person, index) => (
                <Reveal
                  key={person.name}
                  className="testimonial-card"
                  style={{ animationDelay: `${index * 110}ms` } as React.CSSProperties}
                >
                  <span className="testimonial-mark" aria-hidden="true">“</span>
                  <p>{person.quote}</p>
                  <div className="testimonial-author">
                    <span className="testimonial-name">{person.name}</span>
                    <span className="testimonial-role">{person.role}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="give" className="give-section">
          <div className="give-orb orb-left" /><div className="give-orb orb-right" />
          <div className="site-shell give-layout"><Reveal><div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> Your kindness, in motion</div><h2>Give a child<br /><em>room to rise.</em></h2><p>Every one-time or monthly gift helps create the safety and opportunity children need to write their own next chapter.</p><div className="give-actions"><Link to="/#donate" className="button button-dark"><Heart size={16} fill="currentColor" /> Donate Now</Link><Link to="/#contact" className="text-link text-link-dark">Talk to our team <ArrowRight size={16} /></Link></div></Reveal><Reveal className="give-image-wrap"><img src={imageUrls.classroom} alt="Volunteer helping children with their notebooks" /><div className="give-image-stamp"><HandHeart size={19} /><span>100% heart.<br /><strong>100% human.</strong></span></div></Reveal></div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
