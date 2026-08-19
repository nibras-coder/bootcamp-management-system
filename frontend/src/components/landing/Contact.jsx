import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    // TODO: connect to backend or email service later
  };

  return (
    <section id="contact" className="bg-[#eef3f1] py-16">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-teal-900 mb-8">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
          <textarea
            name="message"
            placeholder="Your message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
          />
          <button
            type="submit"
            className="bg-teal-800 text-white px-6 py-3 rounded-lg hover:bg-teal-900"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;