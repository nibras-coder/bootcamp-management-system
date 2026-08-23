import React from 'react';
import { FiLinkedin, FiGithub } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const mentors = [
  { 
    id: 1,
    name: "Ahmed Yusuf", 
    role: "Full-Stack Mentor",
    bio: "Passionate about building scalable web applications and helping students master modern frontend frameworks.",
    expertise: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    image: "https://ui-avatars.com/api/?name=Ahmed+Yusuf&background=0f766e&color=fff&size=128"
  },
  { 
    id: 2,
    name: "Sara Ali", 
    role: "UI/UX Mentor",
    bio: "Design thinker focused on creating accessible and beautiful user experiences with Figma and user research.",
    expertise: ["Figma", "User Research", "Wireframing", "Prototyping"],
    image: "https://ui-avatars.com/api/?name=Sara+Ali&background=0f766e&color=fff&size=128"
  },
  { 
    id: 3,
    name: "Hamza Kedir", 
    role: "Mobile Dev Mentor",
    bio: "Flutter enthusiast. I'll teach you how to build robust cross-platform mobile apps efficiently.",
    expertise: ["Flutter", "Dart", "Firebase", "State Management"],
    image: "https://ui-avatars.com/api/?name=Hamza+Kedir&background=0f766e&color=fff&size=128"
  },
  { 
    id: 4,
    name: "Fatima Nur", 
    role: "Data Science Mentor",
    bio: "Data lover and Python advocate. Let's dive deep into machine learning and data visualization together.",
    expertise: ["Python", "Pandas", "Scikit-Learn", "Data Viz"],
    image: "https://ui-avatars.com/api/?name=Fatima+Nur&background=0f766e&color=fff&size=128"
  },
  { 
    id: 5,
    name: "Omar Kedir", 
    role: "Backend Mentor",
    bio: "Database architecture specialist. Helping you build APIs that are fast, secure, and reliable.",
    expertise: ["Django", "Python", "PostgreSQL", "Docker"],
    image: "https://ui-avatars.com/api/?name=Omar+Kedir&background=0f766e&color=fff&size=128"
  },
  { 
    id: 6,
    name: "Yasmin Ali", 
    role: "CP Mentor",
    bio: "Competitive programmer and algorithms enthusiast. Preparing you for top-tier coding interviews.",
    expertise: ["C++", "Algorithms", "Data Structures"],
    image: "https://ui-avatars.com/api/?name=Yasmin+Ali&background=0f766e&color=fff&size=128"
  }
];

function Mentors({ isHighlight = false }) {
  const displayedMentors = isHighlight ? mentors.slice(0, 4) : mentors;

  return (
    <section id="mentors" className="bg-[#eef3f1] py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {isHighlight && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-teal-900 mb-4">Meet Our Mentors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Learn from experienced brothers and sisters guiding every track. Connect with mentors who are dedicated to your growth.
            </p>
          </div>
        )}

        {isHighlight ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayedMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col items-center group relative overflow-hidden"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-teal-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                  <img 
                    src={mentor.image} 
                    alt={mentor.name} 
                    className="w-24 h-24 rounded-full relative z-10 border-4 border-white shadow-sm object-cover"
                  />
                </div>
                
                <h3 className="text-xl font-bold text-teal-900 mb-1">{mentor.name}</h3>
                <p className="text-sm font-semibold text-teal-600 mb-4">{mentor.role}</p>
                
                <p className="text-sm text-gray-500 mb-6 leading-relaxed flex-1">
                  "{mentor.bio}"
                </p>
                
                <div className="flex gap-4 mt-auto">
                  <a href="#" className="p-2 text-gray-400 hover:text-teal-600 bg-gray-50 hover:bg-teal-50 rounded-full transition-colors">
                    <FiGithub className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-2 text-gray-400 hover:text-teal-600 bg-gray-50 hover:bg-teal-50 rounded-full transition-colors">
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-8">
            {displayedMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col md:flex-row gap-8 items-center md:items-start transition-all duration-300 hover:shadow-lg"
              >
                <img 
                  src={mentor.image} 
                  alt={mentor.name} 
                  className="w-24 h-24 object-cover rounded-2xl shadow-sm flex-shrink-0"
                />
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-teal-900 mb-1">{mentor.name}</h3>
                  <p className="text-base font-semibold text-teal-600 mb-4">{mentor.role}</p>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {mentor.bio}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Expertise & Skills</h4>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {mentor.expertise.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-gray-50 text-teal-700 text-sm rounded-md border border-gray-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6 justify-center md:justify-start">
                    <a href="#" className="p-2 text-gray-400 hover:text-teal-600 bg-gray-50 hover:bg-teal-50 rounded-full transition-colors">
                      <FiGithub className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-2 text-gray-400 hover:text-teal-600 bg-gray-50 hover:bg-teal-50 rounded-full transition-colors">
                      <FiLinkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isHighlight && (
          <div className="mt-16 text-center">
            <Link 
              to="/mentors" 
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-sm hover:shadow-md"
            >
              Read more about our mentors
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default Mentors;