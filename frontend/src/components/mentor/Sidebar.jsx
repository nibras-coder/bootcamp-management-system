import logo from "../../assets/logo.png";
import { useState, useEffect } from "react";
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
  MessageSquare,
  Download,
} from "lucide-react";
import API from "../../api/axios";
import { getSocket } from "../../utils/socket";

function Sidebar({ isOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isStudent = user.role === "student";

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await API.get("/communities/unread");
        if (res.data.success && typeof res.data.totalUnread === "number") {
          setUnreadCount(res.data.totalUnread);
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();

    const socket = getSocket();
    const handleNewMsg = (msg) => {
      const isMe = String(msg.sender?._id || msg.sender) === String(user._id || user.id);
      if (!isMe && location.pathname !== "/communities") {
        setUnreadCount((prev) => prev + 1);
      }
    };
    const handleNotifNew = () => {
      if (location.pathname !== "/communities") {
        setUnreadCount((prev) => prev + 1);
      }
    };
    const handleNotifRead = () => {
      fetchUnread();
    };

    socket.on("community:message:new", handleNewMsg);
    socket.on("community:notification:new", handleNotifNew);
    socket.on("community:notification:read", handleNotifRead);

    return () => {
      socket.off("community:message:new", handleNewMsg);
      socket.off("community:notification:new", handleNotifNew);
      socket.off("community:notification:read", handleNotifRead);
    };
  }, [location.pathname, user._id, user.id]);

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
    { label: "Communities", icon: MessageSquare, path: "/communities" },
    { label: "Resources", icon: BookOpen, path: "/resources" },
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];



  const navItems = isStudent ? studentNavItems : mentorNavItems;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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
        className={`fixed top-0 left-0 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-gray-100 h-screen flex flex-col justify-between border-r border-gray-200 dark:border-gray-800 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="w-10 h-10 object-cover rounded-full bg-white dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700"
            />
            <div>
              <h1 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">ASTU MSJ</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {isStudent ? "Student Portal" : "Mentor Panel"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm border-l-4 border-teal-600 dark:border-teal-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}


        </nav>

        {/* Bottom User Card with Logout Below Name */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-black/20">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : isStudent ? "S" : "M"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {user.name || (isStudent ? "Student" : "Mentor")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role || (isStudent ? "student" : "mentor")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-bold transition-all bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg"
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
