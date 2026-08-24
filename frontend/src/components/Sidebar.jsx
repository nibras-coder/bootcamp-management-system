import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, TrendingUp, FileText,
  Award, Megaphone, User, Settings, LogOut, X
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/mentor/dashboard" },
  { label: "My Students", icon: Users, path: "/mentor/students" },
  { label: "Attendance", icon: Calendar, path: "/mentor/attendance" },
  { label: "Progress", icon: TrendingUp, path: "/mentor/progress" },
  { label: "Assignments", icon: FileText, path: "/mentor/assignments" },
  { label: "Grading", icon: Award, path: "/mentor/grading" },
  { label: "Announcements", icon: Megaphone, path: "/mentor/announcements" },
  { label: "Profile", icon: User, path: "/mentor/profile" },
  { label: "Settings", icon: Settings, path: "/mentor/settings" },
];

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-teal-900 text-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-6 py-6 border-b border-teal-800 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">ASTU MSJ</h1>
            <p className="text-teal-300 text-sm">Bootcamp System</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-teal-300 hover:text-white">
              <X size={22} />
            </button>
          )}
        </div>

        <nav className="mt-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-teal-800 text-white"
                  : "text-teal-200 hover:bg-teal-800/50"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-teal-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 text-teal-200 text-sm hover:bg-teal-800/50 rounded"
        >
          <LogOut size={18} />
          Logout
        </button>
        <div className="flex items-center gap-3 mt-3 px-2">
          <div className="w-9 h-9 rounded-full bg-teal-700" />
          <div>
            <p className="text-sm font-medium">Mentor</p>
            <p className="text-xs text-teal-300">Mentor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;