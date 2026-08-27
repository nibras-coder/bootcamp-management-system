import { useState } from "react";

const aboutItems = [
  {
    title: "Learn",
    description:
      "Gain practical knowledge through structured learning and hands-on activities.",
    icon: "📚",
  },
  {
    title: "Build",
    description:
      "Turn your ideas into real projects while developing valuable technical skills.",
    icon: "💻",
  },
  {
    title: "Grow",
    description:
      "Connect with mentors and other students while growing together as a community.",
    icon: "🚀",
  },
];

const About = () => {
  const [activeItem, setActiveItem] = useState(0);

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[#0f766e] font-semibold mb-3">
            ABOUT US
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a]">
            Learn. Build.{" "}
            <span className="text-[#0f766e]">Grow Together.</span>
          </h2>

          <p className="mt-5 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            MSJ is a collaborative bootcamp designed to help students
            develop practical skills, build meaningful projects, and
            connect with mentors and fellow learners.
          </p>
        </div>

        {/* Dynamic Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {aboutItems.map((item, index) => (
            <button
              key={item.title}
              onClick={() => setActiveItem(index)}
              className={`text-left p-8 rounded-2xl border transition-all duration-300 ${
                activeItem === index
                  ? "bg-[#0f766e] text-white border-[#0f766e] shadow-xl -translate-y-2"
                  : "bg-[#f3f6f8] text-[#1f2937] border-gray-200 dark:border-gray-700 hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              <div className="text-4xl mb-5">{item.icon}</div>

              <h3 className="text-2xl font-bold mb-3">
                {item.title}
              </h3>

              <p
                className={`leading-relaxed ${
                  activeItem === index
                    ? "text-white/90"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.description}
              </p>
            </button>
          ))}
        </div>

        {/* Dynamic Information */}
        <div className="mt-10 text-center">
          <p className="text-gray-500">
            Selected focus:{" "}
            <span className="font-semibold text-[#0f766e]">
              {aboutItems[activeItem].title}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;