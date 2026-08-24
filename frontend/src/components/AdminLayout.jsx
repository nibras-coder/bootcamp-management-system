import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

import {
  LuLayoutDashboard,
  LuUsers,
  LuBookOpen,
  LuMegaphone,
  LuLogOut,
} from "react-icons/lu";

const AdminLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: LuLayoutDashboard,
    },
    {
      to: "/admin/mentors",
      label: "Mentors",
      icon: LuUsers,
    },
    {
      to: "/admin/batches",
      label: "Batches",
      icon: LuBookOpen,
    },
    {
      to: "/admin/announcements",
      label: "Announcements",
      icon: LuMegaphone,
    },
  ];

  return (
    <div className="flex h-screen bg-bootcamp-background font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-bootcamp-sidebar text-white flex flex-col z-20 shadow-2xl">
        {/* Brand */}
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

        {/* Navigation */}
        <nav className="flex-1 px-5 py-8 space-y-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-all ${
                  isActive
                    ? "bg-bootcamp-primary text-white font-semibold shadow-md"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="text-2xl" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-5 border-t border-white/10 mb-2">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-lg font-medium transition-all"
          >
            <LuLogOut className="text-2xl" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
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

        {/* IMPORTANT: React Router renders child pages here */}
        <div className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
