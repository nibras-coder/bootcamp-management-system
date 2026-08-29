import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiGrid,
  FiLayers,
  FiUsers,
  FiUser,
  FiCheckSquare,
  FiFileText,
  FiBell,
  FiBarChart2,
  FiSettings,
  FiBook,
  FiDownload,
} from "react-icons/fi";
import logo from "../assets/logo.png";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
    { label: "Tracks", path: "/admin/batches", icon: FiLayers },
    { label: "Applications", path: "/admin/applications", icon: FiUsers },
    { label: "Mentors", path: "/admin/mentors", icon: FiUser },
    { label: "Students", path: "/admin/students", icon: FiUsers },
    { label: "Attendance", path: "/admin/attendance", icon: FiCheckSquare },
    { label: "Assignments", path: "/admin/assignments", icon: FiFileText },
    { label: "Announcements", path: "/admin/announcements", icon: FiBell },
    { label: "Resources", path: "/admin/resources", icon: FiBook },
    { label: "Reports", path: "/admin/reports", icon: FiBarChart2 },
    { label: "Settings", path: "/admin/settings", icon: FiSettings },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-64 h-screen bg-teal-900 dark:bg-black text-white fixed flex flex-col justify-between border-r border-teal-800 dark:border-gray-800 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-teal-800 dark:border-gray-800 flex items-center gap-3 flex-shrink-0">
        <img
          src={logo}
          alt="ASTU MSJ Logo"
          className="w-10 h-10 object-cover rounded-full bg-white dark:bg-gray-800 p-0.5 border border-teal-700/50"
        />
        <div>
          <h1 className="font-bold text-base text-white leading-tight">ASTU MSJ</h1>
          <p className="text-xs text-teal-300 dark:text-teal-400 font-medium">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#0a8586] dark:bg-[#111] text-white shadow-sm border-l-4 border-white dark:border-teal-400"
                  : "text-teal-100 dark:text-gray-300 hover:bg-teal-800/50 dark:hover:bg-gray-900/60 hover:text-white"
              }`}
            >
              <item.icon
                size={18}
                className={isActive ? "text-white dark:text-teal-400" : "text-teal-300 dark:text-gray-400"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}


      </nav>

      {/* Bottom User Card with Logout Below Name */}
      <div className="p-3 border-t border-teal-800 dark:border-gray-800 flex-shrink-0 bg-teal-950/20 dark:bg-black">
        <div className="p-3 rounded-xl bg-white/5 dark:bg-[#0a0a0a] border border-white/10 dark:border-gray-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 dark:from-teal-800 dark:to-teal-950 text-teal-900 dark:text-teal-200 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.name || "Admin"}</p>
              <p className="text-xs text-teal-300 dark:text-teal-400 capitalize">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:text-white text-xs font-bold transition-all bg-red-500/10 hover:bg-red-600/80 rounded-lg"
          >
            <FiLogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

