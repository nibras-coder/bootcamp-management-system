import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/heroImage.png";

const tracks = [
  {
    slug: "web-development",
    icon: "💻",
    name: "Web Development",
    desc: "Learn how to build modern websites and web applications.",
  },
  {
    slug: "mobile-development",
    icon: "📱",
    name: "Mobile Development",
    desc: "Build useful and beautiful mobile applications.",
  },
  {
    slug: "ui-ux",
    icon: "🎨",
    name: "UI/UX Design",
    desc: "Learn design principles and create user-friendly experiences.",
  },
  {
    slug: "data-science",
    icon: "📊",
    name: "Data Science",
    desc: "Explore data, analytics, and practical machine learning.",
  },
];

const steps = [
  [
    "01",
    "Choose your track",
    "Select the learning path that matches your interests and goals.",
  ],
  [
    "02",
    "Learn with mentors",
    "Follow practical lessons and get guidance from experienced mentors.",
  ],
  [
    "03",
    "Build projects",
    "Put your knowledge into practice by building real projects.",
  ],
  [
    "04",
    "Grow together",
    "Learn, collaborate, and improve together with your cohort.",
  ],
];

const features = [
  [
    "📚",
    "Structured learning",
    "Follow a clear learning path designed to help you progress step by step.",
  ],
  [
    "👨‍🏫",
    "Experienced mentors",
    "Get guidance and support from mentors throughout your journey.",
  ],
  [
    "🛠️",
    "Practical projects",
    "Build projects that allow you to apply what you learn.",
  ],
  [
    "🤝",
    "Community",
    "Learn and collaborate with other students in a supportive environment.",
  ],
];

const mentors = [
  [
    "AM",
    "Abdullah Mohammed",
    "Web Development Mentor",
    "Helping students build strong foundations in web development.",
  ],
  [
    "FA",
    "Fatima Ahmed",
    "UI/UX Mentor",
    "Helping students understand design and user experience.",
  ],
  [
    "OM",
    "Omar Hassan",
    "Data Science Mentor",
    "Helping students explore data and practical analytics.",
  ],
];

const faqs = [
  [
    "Who can join the bootcamp?",
    "The bootcamp is designed for MSJ members who want to learn, build projects, and grow together.",
  ],
  [
    "How long is each cohort?",
    "Each cohort runs for approximately three weeks.",
  ],
  ["Is the bootcamp free?", "Yes. The bootcamp is free for MSJ members."],
  [
    "Do I need previous experience?",
    "No. Beginners can join and learn from the foundations.",
  ],
];

function Home() {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <img
          className="hero-image"
          src={heroImage}
          alt="ASTU MSJ students studying together"
        />

        <div className="hero-fade" />

        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

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
              <button
                className="btn primary"
                onClick={() => navigate("/register")}
              >
                Join the next cohort
              </button>

              <button
                className="btn outline"
                onClick={() =>
                  document
                    .getElementById("tracks")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore tracks
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="container stats-grid">
          {[
            ["4", "Learning tracks"],
            ["3 weeks", "Per cohort"],
            ["6+", "Active mentors"],
            ["Free", "For MSJ members"],
          ].map(([number, text]) => (
            <div key={text}>
              <b>{number}</b>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="section container">
        <div className="section-title">
          <h2>Our tracks</h2>

          <p>
            Choose one path and go deep. Every track is mentor-led and
            project-based.
          </p>
        </div>

        <div className="track-grid">
          {tracks.map((track) => (
            <article className="card track-card" key={track.slug}>
              <div className="icon">{track.icon}</div>

              <h3>{track.name}</h3>

              <p>{track.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section container">
        <div className="how-card">
          <h2>How it works</h2>

          <div className="steps">
            {steps.map(([number, title, description]) => (
              <div className="step" key={number}>
                <span>{number}</span>

                <h3>{title}</h3>

                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section container">
        <div className="section-title">
          <h2>What you get</h2>
        </div>

        <div className="feature-grid">
          {features.map(([icon, title, description]) => (
            <article className="feature-card" key={title}>
              <div className="icon">{icon}</div>

              <h3>{title}</h3>

              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* MENTORS */}
      <section className="section container">
        <div className="section-head row">
          <div className="section-title">
            <h2>Meet a few mentors</h2>

            <p>Brothers and sisters guiding every Track.</p>
          </div>
        </div>

        <div className="mentor-grid">
          {mentors.slice(0, 3).map((mentor) => (
            <article className="card mentor-card" key={mentor[1]}>
              <div className="initials">{mentor[0]}</div>

              <h3>{mentor[1]}</h3>

              <span>{mentor[2]}</span>

              <p>{mentor[3]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section container faq-section">
        <div className="section-title">
          <h2>Questions</h2>
        </div>

        <div className="faq">
          {faqs.map(([question, answer], index) => (
            <div className="faq-item" key={question}>
              <button
                type="button"
                onClick={() => setFaqOpen(faqOpen === index ? null : index)}
              >
                <span>{question}</span>

                <b>{faqOpen === index ? "−" : "+"}</b>
              </button>

              {faqOpen === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container cta">
        <div>
          <h2>Ready to start your track?</h2>

          <p>Registration for the next cohort is open now.</p>
        </div>

        <button className="btn light" onClick={() => navigate("/register")}>
          Create your account
        </button>
      </section>
    </>
  );
}

export default Home;
