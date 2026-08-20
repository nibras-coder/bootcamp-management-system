import React, { useEffect, useMemo, useState } from "react";
import "./style.css";
import "./pages/student-dashboard.css";
import API from "./api/axios";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

const tracks = [
  {
    slug: "web",
    icon: "</>",
    name: "Web Development",
    desc: "HTML, CSS, JavaScript, React and Node.js.",
    details:
      "Build real web apps from static pages to full stack projects, with weekly code reviews.",
    weeks: 3,
    level: "Beginner friendly",
  },
  {
    slug: "mobile",
    icon: "▣",
    name: "Mobile Development",
    desc: "Flutter, Dart and modern mobile tools.",
    details:
      "Ship your first Android app: layouts, state, APIs and publishing basics.",
    weeks: 3,
    level: "Beginner friendly",
  },
  {
    slug: "design",
    icon: "◈",
    name: "UI/UX Design",
    desc: "Design thinking, Figma and prototyping.",
    details:
      "Research, wireframes, design systems and clickable prototypes for your portfolio.",
    weeks: 3,
    level: "All levels",
  },
  {
    slug: "data",
    icon: "▥",
    name: "Data Science",
    desc: "Python, machine learning and analysis.",
    details:
      "Python fundamentals, pandas, visualisation and a first machine learning model.",
    weeks: 3,
    level: "Some coding helpful",
  },
];

const steps = [
  [
    "01",
    "Register",
    "Create your account and pick the track that fits your goals.",
  ],
  [
    "02",
    "Get placed in a batch",
    "You are matched with a mentor and a learning batch.",
  ],
  [
    "03",
    "Learn and build",
    "Weekly sessions, assignments and hands-on projects.",
  ],
  [
    "04",
    "Graduate",
    "Finish your capstone and earn your bootcamp certificate.",
  ],
];

const features = [
  [
    "◷",
    "Attendance you can trust",
    "Every session is recorded so you always know where you stand.",
  ],
  [
    "♧",
    "Mentors beside you",
    "Small batches with a dedicated mentor reviewing your work.",
  ],
  [
    "▥",
    "Progress in the open",
    "Assignments, grades and milestones in one clear dashboard.",
  ],
  [
    "♙",
    "Certificate on graduation",
    "Complete your capstone and earn a verified bootcamp certificate.",
  ],
  [
    "▢",
    "Free learning resources",
    "Curated notes, recordings and exercises for every track.",
  ],
  [
    "♡",
    "A community that stays",
    "Study circles, alumni support and job-ready portfolio reviews.",
  ],
];

const mentors = [
  [
    "AN",
    "Ahmed Nasir",
    "Lead Mentor — Web Development",
    "Full stack developer focused on React and Node.js, mentoring beginners into their first deployed project.",
  ],
  [
    "FY",
    "Fatima Yusuf",
    "Mentor — UI/UX Design",
    "Product designer working in Figma, teaching research, design systems and accessible interfaces.",
  ],
  [
    "BK",
    "Bilal Kedir",
    "Mentor — Mobile Development",
    "Flutter developer who has shipped several Android apps and loves clean architecture.",
  ],
  [
    "HA",
    "Hafsa Abdurahman",
    "Mentor — Data Science",
    "Python and machine learning enthusiast guiding students through their first data projects.",
  ],
  [
    "US",
    "Umar Salah",
    "Mentor — Web Development",
    "Backend engineer covering APIs, databases and deployment for the web track.",
  ],
  [
    "AM",
    "Ayan Mohammed",
    "Program Coordinator",
    "Coordinates batches, schedules and attendance so every cohort runs smoothly.",
  ],
];

const faqs = [
  [
    "Who can join the bootcamp?",
    "Any ASTU student who is ready to commit to the weekly sessions and assignments. No prior experience is required for the beginner tracks.",
  ],
  [
    "How long does the program run?",
    "Each cohort runs for three weeks of intensive sessions, followed by a capstone project reviewed by your mentor.",
  ],
  [
    "Is there any fee?",
    "No. The bootcamp is completely free for MSJ members.",
  ],
  [
    "How is attendance tracked?",
    "Mentors mark attendance in each session and you can follow your own record from your student dashboard.",
  ],
  [
    "Do I get a certificate?",
    "Yes. Students who complete the sessions and the capstone project receive an ASTU MSJ Bootcamp certificate.",
  ],
];

const navItems = [
  ["/", "Home"],
  ["/tracks", "Tracks"],
  ["/mentors", "Mentors"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

function go(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function Logo({ size = 42 }) {
  return (
    <button
      className="logo"
      onClick={() => go("/")}
      aria-label="ASTU MSJ Bootcamp home"
    >
      <img
        src="/assets/msj-logo.jpg"
        alt="ASTU Muslim Students Jemea logo"
        style={{ width: size, height: size }}
      />
      <span>
        ASTU MSJ <b>Bootcamp</b>
      </span>
    </button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);

    window.addEventListener("popstate", close);

    return () => {
      window.removeEventListener("popstate", close);
    };
  }, []);

  return (
    <header className="header">
      <div className="nav container">
        <Logo />

        <nav className={open ? "nav-links open" : "nav-links"}>
          {navItems.map(([path, label]) => (
            <a
              key={path}
              href={path}
              className={
                window.location.pathname === path ? "active" : ""
              }
              onClick={(e) => {
                e.preventDefault();
                go(path);
                setOpen(false);
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="ghost-btn" onClick={() => go("/login")}>
            Login
          </button>

          <button className="small-btn" onClick={() => go("/register")}>
            Register
          </button>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? "×" : "☰"}
        </button>
      </div>
    </header>
  );
}

function SocialIcon({ type }) {
  const paths = {
    telegram: (
      <path d="M21.4 3.5 2.9 10.7c-1.2.5-1.2 2.2 0 2.6l4.7 1.5 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.5-3.1 4.9 3.5c.9.7 2.1.1 2.3-1l2.4-15c.2-1.3-1-2.2-2.3-1.7ZM9.2 14.3l9.4-7.1-7.9 8.4-.4 2.7-1.1-4Z" />
    ),
    facebook: (
      <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.2c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.1V10H8v3h2.5v8h3.2Z" />
    ),
    instagram: (
      <path
        fillRule="evenodd"
        d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm4.8 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5-2.7a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
        clipRule="evenodd"
      />
    ),
    youtube: (
      <path d="M21.7 7.2a3 3 0 0 0-2.1-2.1C17.9 4.6 12 4.6 12 4.6s-5.9 0-7.6.5a3 3 0 0 0-2.1 2.1C1.8 8.9 1.8 12 1.8 12s0 3.1.5 4.8a3 3 0 0 0 2.1 2.1c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a3 3 0 0 0 2.1-2.1c.5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8ZM10 15.7V8.3l6.2 3.7-6.2 3.7Z" />
    ),
    tiktok: (
      <path d="M14.2 3h3.2c.2 1.7 1.1 3.1 2.6 4v3.2c-1.4-.1-2.7-.5-3.8-1.2v6.2a5.3 5.3 0 1 1-4.7-5.2v3.3a2.2 2.2 0 1 0 1.5 2V3h1.2Z" />
    ),
    x: (
      <path d="M18.9 2H22l-6.8 7.8L23.1 22h-6.2l-4.8-6.3L6.6 22H3.5l7.2-8.2L2.9 2h6.4l4.3 5.7L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z" />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[type]}
    </svg>
  );
}

function Footer() {
  const socials = [
    ["telegram", "Telegram", "https://t.me/astumsj"],
    ["instagram", "Instagram", "https://instagram.com/astumsj"],
    ["facebook", "Facebook", "https://facebook.com/astumsj"],
    ["tiktok", "TikTok", "https://www.tiktok.com/@astumsj"],
    ["youtube", "YouTube", "https://youtube.com/@astumsj"],
    ["x", "X", "https://x.com/astumsj"],
  ];

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-main">
          <Logo size={44} />

          <p>
            A centralized platform to manage bootcamp activities, track
            progress and grow together — run by Adama Science and Technology
            University Muslim Students Jemea.
          </p>

          <div className="socials">
            {socials.map(([type, label, url]) => (
              <a
                className={`social social-${type}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                key={type}
              >
                <SocialIcon type={type} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4>Explore</h4>
          <a href="/tracks">Tracks</a>
          <a href="/mentors">Mentors</a>
          <a href="/about">About us</a>
          <a href="/contact">Contact</a>
        </div>

        <div>
          <h4>Account</h4>
          <a href="/login">Member login</a>
          <a href="/register">Create account</a>
          <a href="/forgot-password">Reset password</a>
        </div>

        <div>
          <h4>Contact</h4>
          <p>hello@astumsj.org</p>
          <p>ASTU, Adama, Ethiopia</p>
          <p>Telegram: @astumsj</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>Made by Nibras Coders</span>
        <span>ASTU MSJ Bootcamp — Learn. Build. Grow Together.</span>
      </div>
    </footer>
  );
}

function Button({ children, variant = "primary", onClick, href }) {
  if (href) {
    return (
      <a
        className={`btn ${variant}`}
        href={href}
        onClick={(e) => {
          e.preventDefault();
          go(href);
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={`btn ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Home() {
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src="/assets/hero-classroom.png"
          alt="ASTU MSJ students studying together"
        />

        <div className="hero-fade" />

        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="arabic">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            <div className="arabic-rule">
              <span></span>۞<span></span>
            </div>

            <h1>
              Learn. Build.
              <br />
              <strong>Grow Together</strong>
            </h1>

            <p>
              A centralized platform to manage bootcamp activities, track your
              progress and achieve success together with your brothers and
              sisters.
            </p>

            <div className="hero-buttons">
              <Button href="/register">Join the next cohort</Button>
              <Button href="/tracks" variant="outline">
                Explore tracks
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          {[
            ["4", "Learning tracks"],
            ["3 weeks", "Per cohort"],
            ["6+", "Active mentors"],
            ["Free", "For MSJ members"],
          ].map(([k, v]) => (
            <div key={v}>
              <b>{k}</b>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="tracks" className="section container">
        <SectionTitle
          title="Our tracks"
          text="Choose one path and go deep. Every track is mentor-led and project-based."
        />

        <div className="track-grid">
          {tracks.map((t) => (
            <article className="card track-card" key={t.slug}>
              <div className="icon">{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="section container">
        <div className="how-card">
          <h2>How it works</h2>

          <div className="steps">
            {steps.map(([n, t, d]) => (
              <div className="step" key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionTitle title="What you get" />

        <div className="feature-grid">
          {features.map(([icon, t, d]) => (
            <article className="feature-card" key={t}>
              <div className="icon">{icon}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head row">
          <SectionTitle
            title="Meet a few mentors"
            text="Brothers and sisters guiding every batch."
          />

          <Button href="/mentors" variant="outline">
            See all mentors
          </Button>
        </div>

        <div className="mentor-grid">
          {mentors.slice(0, 3).map((m) => (
            <MentorCard key={m[1]} m={m} />
          ))}
        </div>
      </section>

      <section className="section container faq-section">
        <SectionTitle title="Questions" />

        <div className="faq">
          {faqs.map(([q, a], i) => (
            <div className="faq-item" key={q}>
              <button
                onClick={() =>
                  setFaqOpen(faqOpen === i ? null : i)
                }
              >
                <span>{q}</span>
                <b>{faqOpen === i ? "−" : "+"}</b>
              </button>

              {faqOpen === i && <p>{a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="container cta">
        <div>
          <h2>Ready to start your track?</h2>
          <p>Registration for the next cohort is open now.</p>
        </div>

        <Button variant="light" href="/register">
          Create your account
        </Button>
      </section>
    </>
  );
}

function SectionTitle({ title, text }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function MentorCard({ m }) {
  return (
    <article className="card mentor-card">
      <div className="initials">{m[0]}</div>
      <h3>{m[1]}</h3>
      <span>{m[2]}</span>
      <p>{m[3]}</p>
    </article>
  );
}

function PageShell({ title, intro, children }) {
  return (
    <>
      <div className="page-shell container">
        <h1>{title}</h1>
        <p className="page-intro">{intro}</p>
        <div className="page-content">{children}</div>
      </div>
    </>
  );
}

function TracksPage() {
  return (
    <PageShell
      title="Learning tracks"
      intro="Pick one track per cohort and go deep. Each track runs three weeks of sessions plus a capstone project reviewed by your mentor."
    >
      <div className="large-grid">
        {tracks.map((t) => (
          <article className="card large-card" key={t.slug}>
            <div className="icon">{t.icon}</div>
            <h2>{t.name}</h2>
            <p>{t.details}</p>

            <div className="pills">
              <span>{t.weeks} weeks</span>
              <span>{t.level}</span>
              <span>Capstone project</span>
            </div>

            <Button href="/register">
              Register for this track
            </Button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function MentorsPage() {
  return (
    <PageShell
      title="Our mentors"
      intro="Every batch is led by a mentor who reviews your work, marks attendance and keeps you moving. Mentors are volunteers from the MSJ community and the wider ASTU tech circle."
    >
      <div className="mentor-grid six">
        {mentors.map((m) => (
          <MentorCard key={m[1]} m={m} />
        ))}
      </div>

      <div className="soft-cta">
        <h2>Want to mentor?</h2>
        <p>
          If you have experience in any of our tracks and can give a few hours
          a week, we would love to have you with us.
        </p>

        <Button href="/contact">Apply as a mentor</Button>
      </div>
    </PageShell>
  );
}

function AboutPage() {
  const values = [
    [
      "Knowledge as worship",
      "Seeking beneficial knowledge is an act of ibadah. We learn with sincerity and discipline.",
    ],
    [
      "Free and open",
      "The bootcamp is completely free for MSJ members. No fees, no hidden costs.",
    ],
    [
      "Brotherhood and sisterhood",
      "Small batches, separate arrangements where needed, and mentors who genuinely care.",
    ],
    [
      "Build real things",
      "Every track ends with a capstone project you can show to employers.",
    ],
  ];

  return (
    <PageShell
      title="About the bootcamp"
      intro="ASTU MSJ Bootcamp is a student-run programme by the Muslim Students Jema of Adama Science and Technology University. We help students gain practical tech skills through mentor-led, project-based cohorts."
    >
      <div className="two-col">
        <article className="info-card">
          <h2>Our mission</h2>
          <p>
            To equip every ASTU student with practical, job-ready technology
            skills in an environment that nurtures both deen and dunya, and to
            make quality tech education accessible to all our members free of
            charge.
          </p>
        </article>

        <article className="info-card">
          <h2>Our vision</h2>
          <p>
            A generation of Muslim students from ASTU who build useful
            software, serve their community and lead with excellence in the
            technology industry.
          </p>
        </article>
      </div>

      <h2 className="subheading">What we stand for</h2>

      <div className="two-col">
        {values.map((v) => (
          <article className="soft-card" key={v[0]}>
            <h3>{v[0]}</h3>
            <p>{v[1]}</p>
          </article>
        ))}
      </div>

      <h2 className="subheading">How a cohort runs</h2>

      <div className="steps light-steps">
        {steps.map((s) => (
          <div className="step" key={s[0]}>
            <span>{s[0]}</span>
            <h3>{s[1]}</h3>
            <p>{s[2]}</p>
          </div>
        ))}
      </div>

      <div className="button-row">
        <Button href="/register">Join the next cohort</Button>
        <Button href="/mentors" variant="outline">
          Meet the mentors
        </Button>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell
      title="Contact us"
      intro="Questions about a cohort, mentoring or working together? Send us a message and the team will get back to you."
    >
      <div className="contact-grid">
        {sent ? (
          <div className="info-card">
            <h2>Message sent</h2>
            <p>
              Jazakallahu khayran. We received your message and will reply by
              email soon.
            </p>

            <Button
              variant="outline"
              onClick={() => setSent(false)}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form
            className="form-card"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <Field label="Full name">
              <input required placeholder="Enter your full name" />
            </Field>

            <Field label="Email">
              <input
                required
                type="email"
                placeholder="you@gmail.com"
              />
            </Field>

            <Field label="Message">
              <textarea
                required
                rows="6"
                placeholder="How can we help?"
              />
            </Field>

            <Button>Send message</Button>
          </form>
        )}

        <div className="side-stack">
          <div className="soft-card">
            <h2>Reach us directly</h2>
            <p>✉ hello@astumsj.org</p>
            <p>⌖ ASTU Main Campus, Adama, Ethiopia</p>
            <p>➤ Telegram: @astumsj</p>
          </div>

          <div className="soft-card">
            <h2>Follow us</h2>

            <div className="socials contact-socials">
              <a
                className="social social-telegram"
                href="https://t.me/astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
              >
                <SocialIcon type="telegram" />
              </a>

              <a
                className="social social-instagram"
                href="https://instagram.com/astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <SocialIcon type="instagram" />
              </a>

              <a
                className="social social-facebook"
                href="https://facebook.com/astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <SocialIcon type="facebook" />
              </a>

              <a
                className="social social-youtube"
                href="https://youtube.com/@astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <SocialIcon type="youtube" />
              </a>

              <a
                className="social social-tiktok"
                href="https://www.tiktok.com/@astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                <SocialIcon type="tiktok" />
              </a>

              <a
                className="social social-x"
                href="https://x.com/astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <SocialIcon type="x" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-main">
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>

        <div className="auth-art">
          <img src="/assets/calligraphy.png" alt="" />
          <div className="art-overlay"></div>

          <div className="auth-brand">
            <Logo size={36} />
            <span className="auth-home-hint">Back to home</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.role === "admin") {
        go("/dashboard");
      } else if (data.user?.role === "student") {
        go("/student-dashboard");
      } else {
        go("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your bootcamp journey."
    >
      <form className="auth-form" onSubmit={submit}>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
          />
        </Field>

        <Field label="Password">
          <div className="password">
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button
              type="button"
              onClick={() => setShow((v) => !v)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <div className="form-options">
          <label>
            <input type="checkbox" /> Remember me
          </label>

          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              go("/forgot-password");
            }}
          >
            Forgot password?
          </a>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <Button>
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              go("/register");
            }}
          >
            Register here
          </a>
        </p>
      </form>
    </AuthShell>
  );
}

function RegisterPage() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        role: "student",
        password,
        confirmPassword,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      go("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the bootcamp today and start your journey."
    >
      <form className="auth-form" onSubmit={submit}>
        <Field label="Full name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </Field>

        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
          />
        </Field>

        <div className="two-inputs">
          <Field label="Password">
            <div className="password">
              <input
                required
                minLength="6"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />

              <button
                type="button"
                onClick={() => setShow((v) => !v)}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          <Field label="Confirm password">
            <input
              required
              minLength="6"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </Field>
        </div>

        <label className="terms">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />

          <span>
            I agree to the <b>Terms and Conditions</b>
          </span>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <Button>
          {loading ? "Creating account..." : "Register"}
        </Button>

        <p className="auth-switch">
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              go("/login");
            }}
          >
            Login here
          </a>
        </p>
      </form>
    </AuthShell>
  );
}

function ForgotPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Forgot your password?"}
      subtitle={
        sent
          ? "If an account exists for that email, a reset link is on its way."
          : "Enter the email you registered with and we will send you a reset link."
      }
    >
      {sent ? (
        <div className="sent-box">
          <h2>Reset link sent</h2>

          <p>
            We sent instructions to <b>{email}</b>. Check your inbox and
            spam folder.
          </p>

          <div className="button-row">
            <Button href="/login">Back to login</Button>

            <Button
              variant="outline"
              onClick={() => setSent(false)}
            >
              Use a different email
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();

            if (email.trim()) {
              setSent(true);
            }
          }}
        >
          <Field label="Email">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
            />
          </Field>

          <Button>Send reset link</Button>

          <p className="auth-switch">
            Remembered it?{" "}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                go("/login");
              }}
            >
              Back to login
            </a>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

/* =========================================================
   APP ROUTING
   ========================================================= */

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const update = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", update);

    return () => {
      window.removeEventListener("popstate", update);
    };
  }, []);

  const page = useMemo(() => {
    switch (path) {
      /* =========================
         LANDING PAGE
      ========================= */
      case "/":
        return <Home />;

      /* =========================
         PUBLIC PAGES
      ========================= */
      case "/tracks":
        return <TracksPage />;

      case "/mentors":
        return <MentorsPage />;

      case "/about":
        return <AboutPage />;

      case "/contact":
        return <ContactPage />;

      /* =========================
         AUTH PAGES
      ========================= */
      case "/login":
        return <LoginPage />;

      case "/register":
        return <RegisterPage />;

      case "/forgot-password":
        return <ForgotPage />;

      /* =========================
         ADMIN DASHBOARD
      ========================= */
      case "/dashboard":
        return <AdminDashboard />;

      /* =========================
         STUDENT DASHBOARD
      ========================= */

      case "/student-dashboard":
      case "/student-dashboard/schedule":
      case "/student-dashboard/attendance":
      case "/student-dashboard/progress":
      case "/student-dashboard/assignments":
      case "/student-dashboard/grades":
      case "/student-dashboard/announcements":
      case "/student-dashboard/achievements":
      case "/student-dashboard/resources":
      case "/student-dashboard/profile":
      case "/student-dashboard/settings":
        return <StudentDashboard />;

      /* =========================
         UNKNOWN URL
      ========================= */
      default:
        return <Home />;
    }
  }, [path]);

  const auth =
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password";

  const dashboard =
    path === "/dashboard";

  const studentDashboard =
    path.startsWith("/student-dashboard");

  return (
    <div className="app">
      {!auth && !dashboard && !studentDashboard && <Header />}

      {page}

      {!auth && !dashboard && !studentDashboard && <Footer />}
    </div>
  );
}

export default App;