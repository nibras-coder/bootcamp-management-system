import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiGrid, FiLogOut, FiUser, FiCheckSquare, FiFileText, FiTrendingUp } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function StudentSidebar({ sidebarOpen, setSidebarOpen, name, handleLogout }) {
  const location = useLocation();

  return (
    <aside
      className={`w-64 shrink-0 bg-teal-900 text-white shadow-xl fixed md:relative z-30 h-full flex flex-col justify-between transition-transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div>
        <div className="p-6 border-b border-teal-800 flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 object-cover rounded-full bg-white dark:bg-gray-800 p-1"
          />
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">
              ASTU MSJ
              <br />
              Bootcamp System
            </h1>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            to="/student-dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/student-dashboard" || location.pathname === "/student-dashboard/"
                ? "bg-teal-800 text-white border-l-4 border-white"
                : "text-teal-100 hover:bg-teal-800/50 hover:text-white"
            }`}
          >
            <FiGrid size={18} className={location.pathname.includes("dashboard") ? "text-white" : "text-teal-300"} />
            Dashboard
          </Link>

          <Link
            to="/student-dashboard/applications"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.includes("/applications") || location.pathname.includes("/apply")
                ? "bg-teal-800 text-white border-l-4 border-white"
                : "text-teal-100 hover:bg-teal-800/50 hover:text-white"
            }`}
          >
            <FiFileText size={18} className={location.pathname.includes("applications") || location.pathname.includes("apply") ? "text-white" : "text-teal-300"} />
            My Applications
          </Link>

          <Link
            to="/attendance"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.includes("/attendance")
                ? "bg-teal-800 text-white border-l-4 border-white"
                : "text-teal-100 hover:bg-teal-800/50 hover:text-white"
            }`}
          >
            <FiCheckSquare size={18} className={location.pathname.includes("attendance") ? "text-white" : "text-teal-300"} />
            My Attendance
          </Link>

          <Link
            to="/assignments"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.includes("/assignments")
                ? "bg-teal-800 text-white border-l-4 border-white"
                : "text-teal-100 hover:bg-teal-800/50 hover:text-white"
            }`}
          >
            <FiFileText size={18} className={location.pathname.includes("assignments") ? "text-white" : "text-teal-300"} />
            Assignments
          </Link>

          <Link
            to="/progress"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.includes("/progress")
                ? "bg-teal-800 text-white border-l-4 border-white"
                : "text-teal-100 hover:bg-teal-800/50 hover:text-white"
            }`}
          >
            <FiTrendingUp size={18} className={location.pathname.includes("progress") ? "text-white" : "text-teal-300"} />
            Progress
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t border-teal-800 bg-teal-950/30">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="bg-teal-800 p-2 rounded-full">
            <FiUser size={24} className="text-teal-200" />
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate w-32">
              {name || "Student"}
            </p>
            <p className="text-xs text-teal-300 capitalize">
              Student
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors hover:bg-red-500/10 rounded-lg"
        >
          <FiLogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
