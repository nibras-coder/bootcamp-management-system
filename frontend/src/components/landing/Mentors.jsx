import React from "react";
import { FiLinkedin, FiGithub, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const mentors = [
  {
    id: 1,
    name: "Ahmed Yusuf",
    role: "Full-Stack Mentor",
    bio: "Passionate about building scalable web applications and helping students master modern frontend frameworks.",
    expertise: ["React", "Node.js", "MongoDB"],
  },
  {
    id: 2,
    name: "Sara Ali",
    role: "UI/UX Mentor",
    bio: "Design thinker focused on creating accessible and beautiful user experiences with Figma and user research.",
    expertise: ["Figma", "UI/UX", "Prototyping"],
  },
  {
    id: 3,
    name: "Hamza Kedir",
    role: "Mobile Dev Mentor",
    bio: "Flutter enthusiast helping students build practical and reliable cross-platform mobile applications.",
    expertise: ["Flutter", "Dart", "Firebase"],
  },
  {
    id: 4,
    name: "Fatima Nur",
    role: "Data Science Mentor",
    bio: "Data lover and Python advocate helping students understand data analysis and machine learning.",
    expertise: ["Python", "Pandas", "Machine Learning"],
  },
  {
    id: 5,
    name: "Omar Kedir",
    role: "Backend Mentor",
    bio: "Database architecture specialist helping students build fast, secure and reliable APIs.",
    expertise: ["Django", "Python", "PostgreSQL"],
  },
  {
    id: 6,
    name: "Yasmin Ali",
    role: "CP Mentor",
    bio: "Competitive programmer and algorithms enthusiast preparing students for challenging programming problems.",
    expertise: ["C++", "Algorithms", "Data Structures"],
  },
];

function MentorAvatar({ name }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mentor-avatar">
      <span>{initials}</span>
    </div>
  );
}

function MentorCard({ mentor }) {
  return (
    <article className="mentor-card">
      <div className="mentor-card-top">
        <div className="mentor-avatar-wrap">
          <MentorAvatar name={mentor.name} />
          <span className="mentor-online-dot"></span>
        </div>

        <div className="mentor-socials">
          <a
            href="#"
            aria-label={`${mentor.name} GitHub`}
            className="mentor-social"
          >
            <FiGithub />
          </a>

          <a
            href="#"
            aria-label={`${mentor.name} LinkedIn`}
            className="mentor-social"
          >
            <FiLinkedin />
          </a>
        </div>
      </div>

      <div className="mentor-info">
        <h3>{mentor.name}</h3>

        <p className="mentor-role">{mentor.role}</p>

        <p className="mentor-bio">{mentor.bio}</p>

        <div className="mentor-skills">
          {mentor.expertise.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Mentors({ isHighlight = false }) {
  const displayedMentors = isHighlight ? mentors.slice(0, 4) : mentors;

  return (
    <section id="mentors" className="mentors-section">
      <div className="container mentors-container">
        {isHighlight && (
          <div className="mentors-heading">
            <span className="section-eyebrow">OUR MENTORS</span>

            <h2>
              Learn from people who
              <span> care about your growth.</span>
            </h2>

            <p>
              Meet the mentors guiding our students through every step of the
              bootcamp journey — from learning the basics to building real
              projects.
            </p>
          </div>
        )}

        <div className="mentors-grid">
          {displayedMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>

        {isHighlight && (
          <div className="mentors-more">
            <Link to="/mentors" className="mentors-more-btn">
              <span>Meet all mentors</span>
              <FiArrowRight />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default Mentors;