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

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/mentor-dashboard" },
  { label: "My Students", icon: Users, path: "/my-students" },
  { label: "Attendance", icon: Calendar, path: "/attendance" },
  { label: "Progress", icon: TrendingUp, path: "/progress" },
  { label: "Assignments", icon: FileText, path: "/assignments" },
  { label: "Grading", icon: Award, path: "/grading" },
  { label: "Announcements", icon: Megaphone, path: "/announcements" },
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Settings", icon: Settings, path: "/settings" },
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
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-10 h-10 object-cover rounded-full"
            />
            <div>
              <h1 className="font-bold text-lg text-white">ASTU MSJ</h1>
              <p className="text-xs text-teal-300">Bootcamp System</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-white">
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-teal-800 text-white font-semibold border-l-4 border-white"
                  : "text-teal-100 hover:bg-teal-800/50"
              }`}
            >
              <item.icon
                size={18}
                className={
                  location.pathname === item.path
                    ? "text-white"
                    : "text-teal-300"
                }
              />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-teal-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 text-red-500 text-sm transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
        <div className="flex items-center gap-3 mt-3 px-2">
          <div className="w-9 h-9 rounded-full bg-teal-700" />
          <div>
            <p className="text-sm font-medium">Yunus Hasen</p>
            <p className="text-xs text-teal-300">Mentor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
