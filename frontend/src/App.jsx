import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./style.css";
import API from "./api/axios";
import { FiMenu, FiX } from "react-icons/fi";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./context/ThemeContext.jsx";

import calligraphy from "./assets/calligraphy.jpg";
import PWAInstallButton from "./components/PWAInstallButton";

// Page Imports
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPage from "./pages/ForgotPage";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import MyStudents from "./pages/MyStudents";
import Attendance from "./pages/Attendance";
import Progress from "./pages/Progress";
import Assignments from "./pages/Assignments";
import Grading from "./pages/Grading";
import Announcements from "./pages/Announcements";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Communities from "./pages/Communities";
import BatchesPage from "./pages/admin/BatchesPage";
import ApplicationsPage from "./pages/admin/ApplicationsPage";
import ApplyPage from "./pages/ApplyPage";
import MentorsPage from "./pages/admin/MentorsPage";
import AdminSettings from "./pages/admin/SettingsPage";
import StudentsPage from "./pages/admin/StudentsPage";
import AttendancePage from "./pages/admin/AttendancePage";
import AssignmentsPage from "./pages/admin/AssignmentsPage";
import AnnouncementsPage from "./pages/admin/AnnouncementsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ResourcesPage from "./pages/admin/ResourcesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";
import StudentNotificationsPage from "./pages/StudentNotificationsPage";
import MentorNotificationsPage from "./pages/MentorNotificationsPage";
import MentorsSection from "./components/landing/Mentors";
import TermsPage from "./pages/TermsPage";

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
    "Get placed in a track",
    "You are matched with a mentor and a learning track.",
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
    "Small tracks with a dedicated mentor reviewing your work.",
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
  {
    id: 1,
    name: "Yasmin Ali",
    role: "Web Dev Mentor",
    expertise: ["React", "Node.js", "MongoDB"],
  },
  {
    id: 2,
    name: "Ahmed Sani",
    role: "CP Mentor",
    expertise: ["C++", "Algorithms", "Codeforces"],
  },
  {
    id: 3,
    name: "Sara Seid",
    role: "Backend Mentor",
    expertise: ["Python", "Django", "PostgreSQL"],
  },
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
  ["Is there any fee?", "No. The bootcamp is completely free for MSJ members."],
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

function Logo({ size = 42 }) {
  const navigate = useNavigate();
  return (
    <button
      className="logo"
      onClick={() => navigate("/")}
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="header">
      <div className="nav container">
        <Logo />
        <nav className={`nav-links ${open ? "open" : ""} dark:max-[700px]:bg-gray-900 dark:max-[700px]:!border-gray-800`}>
          {navItems.map(([path, label]) => (
            <a
              key={path}
              href={path}
              className={`${location.pathname === path ? "active" : ""} dark:text-gray-100 dark:hover:text-teal-400`}
              onClick={(e) => {
                e.preventDefault();
                navigate(path);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions flex items-center gap-3">
          
          <button className="ghost-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="small-btn !bg-[#0b746d] !text-white hover:!bg-[#075f5a]" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
        <button
          className="mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? (
            <FiX className="text-2xl size-6" />
          ) : (
            <FiMenu className="text-2xl size-6" />
          )}
        </button>
      </div>
    </header>
  );
}

function SocialIcon({ type }) {
  const paths = {
    tiktok: (
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    ),
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
    x: (
      <path d="M18.9 2H22l-6.8 7.8L23.1 22h-6.2l-4.8-6.3L6.6 22H3.5l7.2-8.2L2.9 2h6.4l4.3 5.7L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z" />
    ),
  };
  return (
    <svg 
      viewBox="0 0 24 24" 
      aria-hidden="true" 
      className={`w-[21px] h-[21px] fill-current ${type === 'tiktok' ? 'drop-shadow-[1px_1px_0_#fe2c55] drop-shadow-[-1px_-1px_0_#25f4ee]' : ''}`}
    >
      {paths[type]}
    </svg>
  );
}

function Footer() {
  const socials = [
    ["telegram", "Telegram", "https://t.me/ASTUMSJ_GROUP"],
    ["instagram", "Instagram", "https://instagram.com/astumsj"],
    ["facebook", "Facebook", "https://facebook.com/astumsj"],
    ["youtube", "YouTube", "https://youtube.com/@astumsj"],
    ["x", "X", "https://x.com/astumsj"],
    ["tiktok", "TikTok", "https://vt.tiktok.com/ZSVak4cxQ/"],
  ];
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-main">
          <Logo size={44} />
          <p>
            A centralized platform to manage bootcamp activities, track progress
            and grow together - run by Adama Science and Technology University
            Muslim Students Jemea.
          </p>
          <div className="socials">
            {socials.map(([type, label, url]) => {
              const colorClasses = {
                telegram: "text-[#229ed9]",
                instagram: "text-[#c13584]",
                facebook: "text-[#1877f2]",
                youtube: "text-[#ff0000]",
                tiktok: "text-[#111] dark:text-gray-200",
                x: "text-[#111] dark:text-gray-200",
              };
              return (
                <a
                  className={`social social-${type} w-11 h-11 p-0 border border-[#cddedb] dark:border-gray-700 rounded-full grid place-items-center bg-white dark:bg-gray-800 shadow-[0_8px_22px_-16px_rgba(19,64,66,0.5)] transition duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#f7fbfa] dark:hover:bg-gray-700 ${colorClasses[type] || "text-[#286d69]"}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  key={type}
                >
                  <SocialIcon type={type} />
                </a>
              );
            })}
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="/tracks">Tracks</a>
          <a href="/mentors">Mentors</a>
          <a href="/about">About us</a>
          <a href="/contact">Contact</a>
          <a href="/terms">Terms & Conditions</a>
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
          <p>Telegram: @ASTUMSJ_GROUP</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>Made by Nibras Coders</span>
        <span>ASTU MSJ Bootcamp - Learn. Build. Grow Together.</span>
      </div>
    </footer>
  );
}

function Button({ children, variant = "primary", onClick, href, className = "" }) {
  const navigate = useNavigate();
  if (href)
    return (
      <a
        className={`btn ${variant} ${className}`.trim()}
        href={href}
        onClick={(e) => {
          if (href.startsWith("#")) {
            e.preventDefault();
            document
              .querySelector(href)
              ?.scrollIntoView({ behavior: "smooth" });
          } else {
            e.preventDefault();
            navigate(href);
          }
        }}
      >
        {children}
      </a>
    );
  return (
    <button className={`btn ${variant} ${className}`.trim()} onClick={onClick}>
      {children}
    </button>
  );
}

function Home() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real tracks from backend
    const fetchTracks = async () => {
      try {
        const response = await API.get("/batches/public");
        if (response.data.success) {
          setTracks(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        // Fallback to default tracks if API fails
        setTracks([
          {
            name: "Web Development",
            track: "Web Dev",
            startDate: new Date(),
            isActive: true,
          },
          {
            name: "Mobile Development",
            track: "Mobile",
            startDate: new Date(),
            isActive: true,
          },
          {
            name: "UI/UX Design",
            track: "Design",
            startDate: new Date(),
            isActive: true,
          },
          {
            name: "Data Science",
            track: "Data",
            startDate: new Date(),
            isActive: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  // Get top 4 tracks
  const topTracks = tracks.slice(0, 4);

  return (
    <>
      <PWAInstallButton />
      <section className="hero">
        <img
          className="hero-image"
          src="/assets/hero-classroom.png"
          alt="ASTU MSJ students studying together"
        />
        <div className="hero-fade" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="arabic text-gray-600 dark:text-gray-300">بسم الله الرحمن الرحيم</div>
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
              <Button href="/register" className="!bg-[#0b746d] !border-[#0b746d] !text-white hover:!bg-[#075f5a] hover:!border-[#075f5a]">Join the next cohort</Button>
              <Button href="#tracks" variant="outline" className="!bg-transparent !border-[#0b746d] !text-[#0b746d] hover:!bg-[#dfeeed]">
                Explore tracks
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          {[
            [tracks.length > 0 ? tracks.length : "4", "Learning tracks"],
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
        <div className="section-title">
          <h2>Our tracks</h2>
          <p>Choose one path and go deep. Every track is mentor-led and project-based.</p>
        </div>
        <div className="track-grid">
          {loading ? (
            <p className="text-gray-500">Loading tracks...</p>
          ) : topTracks.length > 0 ? (
            topTracks.map((t) => (
              <article className="card track-card" key={t._id || t.name}>
                <div className="icon">
                  {t.track?.charAt(0).toUpperCase() || t.name?.charAt(0).toUpperCase()}
                </div>
                <h3>{t.track || t.name}</h3>
                <p>{t.name || "Learning track"}</p>
              </article>
            ))
          ) : (
            <p className="text-gray-500">No active tracks available</p>
          )}
        </div>
        <div className="text-center mt-6">
          <Button href="/tracks" variant="outline">
            View All Tracks
          </Button>
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

      <MentorsSection isHighlight={true} />

      <section className="section container faq-section">
        <SectionTitle title="Questions" />
        <div className="faq">
          {faqs.map(([q, a], i) => (
            <div className="faq-item" key={q}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <span>{q}</span>
                <b>{faqOpen === i ? "-" : "+"}</b>
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
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xl font-bold mb-4">
        {getInitials(m.name)}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{m.name}</h3>
      <span className="text-sm font-medium text-teal-600 mb-4">{m.role}</span>
      <div className="flex flex-wrap justify-center gap-2">
        {m.expertise.map((skill, index) => (
          <span
            key={index}
            className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:text-gray-300"
          >
            {skill}
          </span>
        ))}
      </div>
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
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await API.get("/batches/public");
        if (response.data.success) {
          setTracks(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  return (
    <PageShell
      title="Learning tracks"
      intro="Pick one track per cohort and go deep. Each track runs three weeks of sessions plus a capstone project reviewed by your mentor."
    >
      <div className="large-grid">
        {loading ? (
          <p className="text-gray-500">Loading tracks...</p>
        ) : tracks.length > 0 ? (
          tracks.map((t) => (
            <article className="card large-card" key={t._id || t.name}>
              <div className="icon">
                {t.track?.charAt(0).toUpperCase() || t.name?.charAt(0).toUpperCase()}
              </div>
              <h2>{t.track || t.name}</h2>
              <p>{t.name || "Learning track"}</p>
              <div className="pills">
                <span>3 weeks</span>
                <span>Beginner friendly</span>
                <span>Capstone project</span>
              </div>
              <Button href="/register">Register for this track</Button>
            </article>
          ))
        ) : (
          <p className="text-gray-500">No active tracks available</p>
        )}
      </div>
    </PageShell>
  );
}

function PublicMentorsPage() {
  return (
    <PageShell
      title="Our Mentors"
      intro="Meet the brothers and sisters guiding every track. Connect with mentors who are dedicated to your growth."
    >
      <MentorsSection />
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
      "Small tracks, separate arrangements where needed, and mentors who genuinely care.",
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
            A generation of Muslim students from ASTU who build useful software,
            serve their community and lead with excellence in the technology
            industry.
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
            <Button variant="outline" onClick={() => setSent(false)}>
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
              <input required type="email" placeholder="you@gmail.com" />
            </Field>
            <Field label="Message">
              <textarea required rows="6" placeholder="How can we help?" />
            </Field>
            <Button>Send message</Button>
          </form>
        )}
        <div className="side-stack">
          <div className="soft-card">
            <h2>Reach us directly</h2>
            <p>hello@astumsj.org</p>
            <p>ASTU Main Campus, Adama, Ethiopia</p>
            <p>Telegram: @ASTUMSJ_GROUP</p>
          </div>
          <div className="soft-card">
            <h2>Follow us</h2>
            <div className="socials contact-socials">
              <a
                className="w-11 h-11 p-0 border border-[#cddedb] dark:border-gray-700 rounded-full grid place-items-center bg-white dark:bg-gray-800 shadow-[0_8px_22px_-16px_rgba(19,64,66,0.5)] transition duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#f7fbfa] dark:hover:bg-gray-700 text-[#229ed9]"
                href="https://t.me/ASTUMSJ_GROUP"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
              >
                <SocialIcon type="telegram" />
              </a>
              <a
                className="w-11 h-11 p-0 border border-[#cddedb] dark:border-gray-700 rounded-full grid place-items-center bg-white dark:bg-gray-800 shadow-[0_8px_22px_-16px_rgba(19,64,66,0.5)] transition duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#f7fbfa] dark:hover:bg-gray-700 text-[#c13584]"
                href="https://instagram.com/astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <SocialIcon type="instagram" />
              </a>
              <a
                className="w-11 h-11 p-0 border border-[#cddedb] dark:border-gray-700 rounded-full grid place-items-center bg-white dark:bg-gray-800 shadow-[0_8px_22px_-16px_rgba(19,64,66,0.5)] transition duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#f7fbfa] dark:hover:bg-gray-700 text-[#1877f2]"
                href="https://facebook.com/astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <SocialIcon type="facebook" />
              </a>
              <a
                className="w-11 h-11 p-0 border border-[#cddedb] dark:border-gray-700 rounded-full grid place-items-center bg-white dark:bg-gray-800 shadow-[0_8px_22px_-16px_rgba(19,64,66,0.5)] transition duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#f7fbfa] dark:hover:bg-gray-700 text-[#ff0000]"
                href="https://youtube.com/@astumsj"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <SocialIcon type="youtube" />
              </a>
              <a
                className="w-11 h-11 p-0 border border-[#cddedb] dark:border-gray-700 rounded-full grid place-items-center bg-white dark:bg-gray-800 shadow-[0_8px_22px_-16px_rgba(19,64,66,0.5)] transition duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#f7fbfa] dark:hover:bg-gray-700 text-[#111] dark:text-gray-200"
                href="https://vt.tiktok.com/ZSVak4cxQ/"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                <SocialIcon type="tiktok" />
              </a>
              <a
                className="w-11 h-11 p-0 border border-[#cddedb] dark:border-gray-700 rounded-full grid place-items-center bg-white dark:bg-gray-800 shadow-[0_8px_22px_-16px_rgba(19,64,66,0.5)] transition duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#f7fbfa] dark:hover:bg-gray-700 text-[#111] dark:text-gray-200"
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

// ForgotPage is imported from pages

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}




function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Public Landing Pages wrapped with Header & Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tracks" element={<TracksPage />} />
          <Route path="/mentors" element={<PublicMentorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Auth Routes (No Header/Footer, utilizing your Custom CSS) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Student Dashboard & Admissions */}
        <Route path="/student-dashboard/*" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={["student"]}><StudentNotificationsPage /></ProtectedRoute>} />
        <Route path="/apply" element={<ProtectedRoute allowedRoles={["student"]}><ApplyPage defaultView="tracks" /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute allowedRoles={["student"]}><ApplyPage defaultView="my-applications" /></ProtectedRoute>} />

        {/* Mentor Dashboard */}
        <Route path="/mentor-dashboard/*" element={<ProtectedRoute allowedRoles={["mentor"]}><MentorDashboard /></ProtectedRoute>} />
        <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
          <Route path="/my-students" element={<MyStudents />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/grading" element={<Grading />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<MentorNotificationsPage />} />
        </Route>

        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Redirect old dashboard to admin/dashboard */}
        <Route
          path="/dashboard"
          element={<Navigate to="/admindashboard" replace />}
        />

        {/* Any unknown URL goes back to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
