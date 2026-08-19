const mentors = [
  { name: "Ahmed Yusuf", role: "Full-Stack Mentor" },
  { name: "Sara Ali", role: "UI/UX Mentor" },
  { name: "Hamza Kedir", role: "Mobile Dev Mentor" },
  { name: "Fatima Nur", role: "Data Science Mentor" },
];

function Mentors() {
  return (
    <section id="mentors" className="bg-[#eef3f1] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-teal-900 mb-8">Our Mentors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor.name}
              className="bg-white rounded-2xl p-6 text-center shadow-sm"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 mb-4" />
              <h3 className="font-semibold text-teal-900">{mentor.name}</h3>
              <p className="text-sm text-gray-500">{mentor.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Mentors;