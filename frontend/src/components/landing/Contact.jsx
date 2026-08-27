import { useState } from "react";

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
      className={`w-[21px] h-[21px] fill-current ${
        type === "tiktok"
          ? "drop-shadow-[1px_1px_0_#fe2c55] drop-shadow-[-1px_-1px_0_#25f4ee]"
          : ""
      }`}
    >
      {paths[type]}
    </svg>
  );
}

const socials = [
  { type: "telegram", label: "Telegram", url: "https://t.me/ASTUMSJ_GROUP", color: "text-[#229ed9]" },
  { type: "instagram", label: "Instagram", url: "https://instagram.com/astumsj", color: "text-[#c13584]" },
  { type: "facebook", label: "Facebook", url: "https://facebook.com/astumsj", color: "text-[#1877f2]" },
  { type: "youtube", label: "YouTube", url: "https://youtube.com/@astumsj", color: "text-[#ff0000]" },
  { type: "x", label: "X", url: "https://x.com/astumsj", color: "text-[#111] dark:text-gray-200" },
  { type: "tiktok", label: "TikTok", url: "https://vt.tiktok.com/ZSVak4cxQ/", color: "text-[#111] dark:text-gray-200" },
];

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
  };

  return (
    <section id="contact" className="bg-white dark:bg-black py-16 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Contact Form */}
        <div>
          <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-400 mb-6">Contact Us</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:border-teal-600"
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:border-teal-600"
            />
            <textarea
              name="message"
              placeholder="Your message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Follow Us / Direct info */}
        <div className="space-y-8 md:pl-6">
          <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-2xl bg-white dark:bg-[#0a0a0a]">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reach us directly</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">hello@astumsj.org</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">ASTU Main Campus, Adama, Ethiopia</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Telegram: @astumsj</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-2xl bg-white dark:bg-[#0a0a0a]">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Follow us</h3>
            <div className="flex flex-wrap gap-3">
              {socials.map(({ type, label, url, color }) => (
                <a
                  key={type}
                  className={`w-11 h-11 border border-[#cddedb] dark:border-gray-800 rounded-full grid place-items-center bg-white dark:bg-[#111] shadow-sm transition duration-200 hover:-translate-y-1 hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-900 ${color}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <SocialIcon type={type} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;