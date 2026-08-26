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
  BookOpen,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

function Sidebar({ isOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = user.role === "student";

  const studentNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/student-dashboard" },
    { label: "My Attendance", icon: Calendar, path: "/student-dashboard/attendance" },
    { label: "Assignments", icon: FileText, path: "/student-dashboard/assignments" },
    { label: "Progress", icon: TrendingUp, path: "/student-dashboard/progress" },
  ];

  const mentorNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/mentor-dashboard" },
    { label: "My Students", icon: Users, path: "/my-students" },
    { label: "Attendance", icon: Calendar, path: "/attendance" },
    { label: "Progress", icon: TrendingUp, path: "/progress" },
    { label: "Assignments", icon: FileText, path: "/assignments" },
    { label: "Grading", icon: Award, path: "/grading" },
    { label: "Announcements", icon: Megaphone, path: "/announcements" },
    { label: "Resources", icon: BookOpen, path: "/resources" },
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const navItems = isStudent ? studentNavItems : mentorNavItems;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 left-0 w-64 bg-teal-900 dark:bg-black text-white h-screen flex flex-col justify-between border-r border-teal-800 dark:border-gray-800 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-teal-800 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-10 h-10 object-cover rounded-full bg-white dark:bg-gray-800 p-0.5 border border-teal-700/50"
            />
            <div>
              <h1 className="font-bold text-base text-white leading-tight">ASTU MSJ</h1>
              <p className="text-xs text-teal-300 dark:text-teal-400 font-medium">
                {isStudent ? "Student Portal" : "Mentor Panel"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-teal-800"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
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
                {user.name ? user.name.charAt(0).toUpperCase() : isStudent ? "S" : "M"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {user.name || (isStudent ? "Student" : "Mentor")}
                </p>
                <p className="text-xs text-teal-300 dark:text-teal-400 capitalize">
                  {user.role || (isStudent ? "student" : "mentor")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:text-white text-xs font-bold transition-all bg-red-500/10 hover:bg-red-600/80 rounded-lg"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
