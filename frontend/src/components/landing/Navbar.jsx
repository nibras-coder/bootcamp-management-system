import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FiMenu } from "react-icons/fi";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:bg-gray-800/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="ASTU MSJ"
            className="absolute top-0 left-4 h-20 w-auto object-contain"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          <a
            href="#home"
            className="text-sm font-medium text-slate-700 transition hover:text-[#136D7A]"
          >
            Home
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-slate-700 transition hover:text-[#136D7A]"
          >
            About
          </a>

          <a
            href="#tracks"
            className="text-sm font-medium text-slate-700 transition hover:text-[#136D7A]"
          >
            Tracks
          </a>

          <a
            href="#mentors"
            className="text-sm font-medium text-slate-700 transition hover:text-[#136D7A]"
          >
            Mentors
          </a>

          <a
            href="#faq"
            className="text-sm font-medium text-slate-700 transition hover:text-[#136D7A]"
          >
            FAQ
          </a>

          <a
            href="#contact"
            className="text-sm font-medium text-slate-700 transition hover:text-[#136D7A]"
          >
            Contact
          </a>
        </div>

        {/* Authentication */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#0F4C5C] transition hover:bg-[#E6F7F7]"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-[#136D7A] right-6 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F4C5C]"
          >
            Register
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <FiMenu className="size-6 text-2xl" />
        </button>

      </div>
    </nav>
  );
};

export default Navbar;