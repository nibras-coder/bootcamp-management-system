import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

import {
  LuLayoutDashboard,
  LuUsers,
  LuBookOpen,
  LuMegaphone,
  LuLogOut,
  LuGraduationCap,
  LuClipboardCheck,
  LuChartBar,
  LuSettings,
} from "react-icons/lu";

const AdminLayout = () => {
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LuLayoutDashboard,
    },
    {
      name: "Mentors",
      path: "/admin/mentors",
      icon: LuGraduationCap,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: LuUsers,
    },
    {
      name: "Batches",
      path: "/admin/batches",
      icon: LuBookOpen,
    },
    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: LuClipboardCheck,
    },
    {
      name: "Assignments",
      path: "/admin/assignments",
      icon: LuBookOpen,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: LuMegaphone,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: LuChartBar,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: LuSettings,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-teal-900 text-white flex flex-col shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-4 px-6 py-7 border-b border-white/10">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="text-xl font-bold">ASTU MSJ</div>
            <div className="text-xs text-teal-200 uppercase tracking-widest">
              Bootcamp
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-teal-500 text-white shadow-md"
                        : "text-teal-100 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={21} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-teal-100 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LuLogOut size={21} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-24 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Panel
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage your ASTU MSJ bootcamp
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">
              Administrator
            </span>

            <div className="w-11 h-11 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* THIS IS VERY IMPORTANT */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;