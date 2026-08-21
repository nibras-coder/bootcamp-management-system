import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Added for routing
import logo from "../assets/logo.png";
import {
  LuLayoutDashboard,
  LuUsers,
  LuBookOpen,
  LuMegaphone,
  LuLogOut,
} from "react-icons/lu";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleLogout = () => {
    // Later, you will clear the JWT token here
    // localStorage.removeItem("token");
    navigate("/login"); // Redirects the user to the login page
  };

  return (
    <div className="flex h-screen bg-bootcamp-background font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-bootcamp-sidebar text-white flex flex-col z-20 shadow-2xl">
        {/* Brand Section */}
        <div className="flex items-center px-6 py-8 border-b border-white/10 gap-4 mt-2">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg shrink-0">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-wider text-white">
              ASTU MSJ
            </span>
            <span className="text-[13px] text-gray-300 tracking-widest uppercase mt-1">
              Bootcamp
            </span>
          </div>
        </div>

        {/* Navigation - Replaced <a> with <Link> */}
        <nav className="flex-1 px-5 py-8 space-y-3">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white text-lg font-medium transition-all"
          >
            <LuLayoutDashboard className="text-2xl" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white text-lg font-medium transition-all"
          >
            <LuUsers className="text-2xl" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/batches"
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white text-lg font-medium transition-all"
          >
            <LuBookOpen className="text-2xl" />
            <span>Batches</span>
          </Link>
          <Link
            to="/admin/announcements"
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white text-lg font-medium transition-all"
          >
            <LuMegaphone className="text-2xl" />
            <span>Announcements</span>
          </Link>
        </nav>

        {/* Logout - Changed to a button with an onClick handler */}
        <div className="p-5 border-t border-white/10 mb-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-lg font-medium transition-all"
          >
            <LuLogOut className="text-2xl" />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-24 bg-bootcamp-surface px-10 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-3xl font-bold text-bootcamp-textDark">
              Welcome back, Admin 👋
            </h1>
            <p className="text-base text-bootcamp-textLight mt-1">
              Here's what's happening in your bootcamp.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-lg text-bootcamp-textDark font-semibold">
              Admin Panel
            </span>
            <div className="w-14 h-14 rounded-full bg-bootcamp-primary flex items-center justify-center text-white text-lg font-bold shadow-md ring-4 ring-bootcamp-background">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-10">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
