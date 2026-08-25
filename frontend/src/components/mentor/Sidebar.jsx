import logo from "../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Award,
  Megaphone,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = user.role === "student";

  // =========================
  // STUDENT NAVIGATION
  // =========================
  const studentNavItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/student-dashboard",
    },
    {
      label: "My Attendance",
      icon: Calendar,
      path: "/student-dashboard/attendance",
    },
    {
      label: "Assignments",
      icon: FileText,
      path: "/student-dashboard/assignments",
    },
    {
      label: "Progress",
      icon: TrendingUp,
      path: "/student-dashboard/progress",
    },
  ];

  // =========================
  // MENTOR NAVIGATION
  // =========================
  const mentorNavItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/mentor/dashboard",
    },
    {
      label: "My Students",
      icon: Users,
      path: "/mentor/students",
    },
    {
      label: "Attendance",
      icon: Calendar,
      path: "/mentor/attendance",
    },
    {
      label: "Progress",
      icon: TrendingUp,
      path: "/mentor/progress",
    },
    {
      label: "Assignments",
      icon: FileText,
      path: "/mentor/assignments",
    },
    {
      label: "Grading",
      icon: Award,
      path: "/mentor/grading",
    },
    {
      label: "Announcements",
      icon: Megaphone,
      path: "/mentor/announcements",
    },
    {
      label: "Profile",
      icon: User,
      path: "/mentor/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/mentor/settings",
    },
  ];

  const navItems = isStudent ? studentNavItems : mentorNavItems;

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // =========================
  // ACTIVE ROUTE
  // =========================
  const isActive = (path) => {
    if (path === "/mentor/dashboard") {
      return location.pathname === "/mentor/dashboard";
    }

    if (path === "/student-dashboard") {
      return location.pathname === "/student-dashboard";
    }

    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-teal-900 text-white min-h-screen flex flex-col justify-between">
      
      {/* =========================
          TOP SECTION
      ========================== */}
      <div>
        
        {/* LOGO */}
        <div className="px-6 py-6 border-b border-teal-800 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-10 h-10 object-cover rounded-full"
            />

            <div>
              <h1 className="font-bold text-lg text-white">
                ASTU MSJ
              </h1>

              <p className="text-xs text-teal-300">
                Bootcamp System
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-white"
              type="button"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* =========================
            NAVIGATION
        ========================== */}
        <nav className="mt-6 px-4 space-y-1">
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded text-sm transition-colors ${
                  active
                    ? "bg-teal-800 text-white font-semibold border-l-4 border-white"
                    : "text-teal-100 hover:bg-teal-800/50"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-white"
                      : "text-teal-300"
                  }
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* =========================
          BOTTOM SECTION
      ========================== */}
      <div className="p-4 border-t border-teal-800">

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-500/10 rounded text-sm transition-colors"
        >
          <LogOut size={18} />

          <span>Logout</span>
        </button>

        {/* USER INFO */}
        <div className="flex items-center gap-3 mt-3 px-2">
          
          <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="min-w-0">
            
            <p className="text-sm font-medium truncate w-32">
              {user.name ||
                (isStudent ? "Student" : "Mentor")}
            </p>

            <p className="text-xs text-teal-300 capitalize">
              {user.role ||
                (isStudent ? "student" : "mentor")}
            </p>

          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;