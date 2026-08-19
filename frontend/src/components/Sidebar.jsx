import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  UserCircle,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import logo from "../assets/logo.png";

const Sidebar = ({ userProfile = null }) => {
  const navigate = useNavigate();

  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Batches", path: "/admin/batches", icon: <Layers size={20} /> },
    { name: "Mentors", path: "/admin/mentors", icon: <UserCircle size={20} /> },
    {
      name: "Students",
      path: "/admin/students",
      icon: <GraduationCap size={20} />,
    },
    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: <CalendarCheck size={20} />,
    },
    {
      name: "Assignments",
      path: "/admin/assignments",
      icon: <ClipboardList size={20} />,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: <Megaphone size={20} />,
    },
    { name: "Reports", path: "/admin/reports", icon: <BarChart3 size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-teal-900 text-white flex flex-col justify-between fixed top-0 left-0">
      {/* Header */}
      <div>
        <div className="p-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-teal-500 shadow-md">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-full h-full object-cover scale-150"
            />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-200 drop-shadow-sm">
              ASTU MSJ
            </h1>
            <p className="text-[10px] text-teal-200 font-bold tracking-widest uppercase mt-0.5">
              Bootcamp System
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-teal-800 text-white"
                    : "text-teal-100 hover:bg-teal-800 hover:text-white"
                }`
              }
            >
              {link.icon}
              <span className="font-medium text-sm">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-teal-800 space-y-4">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg w-full text-teal-100 hover:bg-transparent hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
        <div className="flex items-center space-x-3 px-2">
          {userProfile?.imageUrl ? (
            <img
              src={userProfile.imageUrl}
              alt="Admin User"
              className="w-10 h-10 rounded-full bg-teal-800 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <User size={24} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">
              {userProfile?.name || "Admin User"}
            </p>
            <p className="text-xs text-teal-300">
              {userProfile?.role || "Super Admin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
