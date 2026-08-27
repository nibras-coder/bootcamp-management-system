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
    <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold shadow-sm ring-4 ring-white relative z-10">
      <span>{initials}</span>
    </div>
  );
}

function MentorCard({ mentor }) {
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg relative overflow-hidden group h-full">
      <div className="absolute top-0 left-0 w-full h-24 bg-teal-50 dark:bg-teal-900/30 opacity-50 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors"></div>
      
      <div className="relative mb-5 pt-4 w-full flex justify-center">
        <div className="relative">
          <MentorAvatar name={mentor.name} />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full z-20"></span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{mentor.name}</h3>
        <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-4">{mentor.role}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow">{mentor.bio}</p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {mentor.expertise.map((skill) => (
            <span key={skill} className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
              {skill}
            </span>
          ))}
        </div>
        
        <div className="flex justify-center gap-3 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href="#"
            aria-label={`${mentor.name} GitHub`}
            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-600 transition-colors"
          >
            <FiGithub size={16} />
          </a>
          <a
            href="#"
            aria-label={`${mentor.name} LinkedIn`}
            className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-600 transition-colors"
          >
            <FiLinkedin size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}

function Mentors({ isHighlight = false }) {
  const displayedMentors = isHighlight ? mentors.slice(0, 4) : mentors;

  return (
    <section id="mentors" className="py-20 bg-gray-50/50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {isHighlight && (
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-sm font-bold tracking-wider text-teal-600 dark:text-teal-400 uppercase mb-4 block">OUR MENTORS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-serif">
              Learn from people who <span className="text-teal-700 dark:text-teal-400 italic">care about your growth.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Meet the mentors guiding our students through every step of the
              bootcamp journey — from learning the basics to building real
              projects.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>

        {isHighlight && (
          <div className="mt-16 flex justify-center">
            <Link to="/mentors" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-teal-700 dark:text-teal-400 font-medium rounded-lg hover:border-teal-200 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
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