import background from "../../assets/Background.jpg";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <img
        src={background}
        alt="Students learning together"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/5"></div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 text-left text-white">
        <div className="max-w-2xl">
          <p className="text-lg md:text-xl mb-6 font-medium">
            بسم الله الرحمن الرحيم
          </p>

          <h1 className="text-black md:text-6xl lg:text-7xl font-bold leading-tight">
            Learn. Build.
            <br />
            <span className="text-teal-700">Grow Together.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-black leading-relaxed">
            Build your skills, connect with mentors, and grow through a
            collaborative bootcamp.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="bg-[#0f766e] text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-[#115e59] transition duration-300 shadow-lg">
              Join the next cohort
            </button>

            <button className="bg-transparent border-2 border-white text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-white hover:text-[#0f766e] transition duration-300">
              Explore Tracks
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
