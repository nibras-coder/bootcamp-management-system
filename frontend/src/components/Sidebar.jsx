<<<<<<< HEAD
=======
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
} from "react-icons/fi";
import logo from "../assets/logo.png";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
    { label: "Tracks", path: "/admin/batches", icon: FiLayers },
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-teal-900 text-white shadow-md fixed flex flex-col justify-between">
      <div className="p-6 border-b border-teal-800 flex items-center gap-3">
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 object-cover rounded-full"
        />
        <div>
          <h1 className="font-bold text-lg text-white">ASTU MSJ</h1>
          <p className="text-xs text-teal-300">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors ${
              location.pathname === item.path
                ? "bg-teal-800 text-white font-semibold border-l-4 border-white"
                : "text-teal-100 hover:bg-teal-800/50"
            }`}
          >
            <item.icon
              size={18}
              className={
                location.pathname === item.path ? "text-white" : "text-teal-300"
              }
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-teal-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 text-red-500 text-sm hover:bg-red-500/10 rounded font-medium transition-colors"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
        <div className="flex items-center gap-3 mt-3 px-2">
          <FiUser
            size={36}
            className="text-teal-300 bg-teal-800 rounded-full p-1"
          />
          <div>
            <p className="text-sm font-medium text-white">Student</p>
            <p className="text-xs text-teal-300">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
>>>>>>> origin/main
