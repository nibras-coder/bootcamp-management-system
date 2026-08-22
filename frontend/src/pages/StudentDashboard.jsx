import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { 
  FiGrid, FiClock, FiCheckSquare, FiTrendingUp, FiFileText, 
  FiStar, FiBell, FiAward, FiBook, FiUser, FiSettings, 
  FiLogOut, FiMenu 
} from "react-icons/fi";
import API from "../api/axios";

import logo from "../assets/logo.png";

const fallback = {
  profile: { name: "", email: "", role: "student", track: "", batch: "" },
  stats: { attendance: null, progress: null, pendingAssignments: null, averageGrade: null },
  progress: [], assignments: [], announcements: [], attendanceWeek: [], schedule: [], attendance: [], grades: [], achievements: [], resources: []
};

function formatDate(date) {
  if (!date) return "Not specified";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ label, value, hint, icon: Icon, tone = "teal" }) {
  const colors = {
    teal: "text-teal-600 bg-teal-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    gold: "text-yellow-600 bg-yellow-100"
  };
  const bgClass = colors[tone] || colors.teal;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
      <div className={`p-4 rounded-full ${bgClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 mb-4"><Icon size={48} /></div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{text}</p>
    </div>
  );
}

function DashboardHome({ data, stats, profile }) {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Attendance" value={stats.attendance ? `${stats.attendance}%` : "N/A"} hint="Overall attendance" icon={FiCheckSquare} tone="teal" />
        <StatCard label="Progress" value={stats.progress ? `${stats.progress}%` : "N/A"} hint="Track completion" icon={FiTrendingUp} tone="blue" />
        <StatCard label="Assignments" value={stats.pendingAssignments || "0"} hint="Pending tasks" icon={FiFileText} tone="purple" />
        <StatCard label="Average Grade" value={stats.averageGrade ? `${stats.averageGrade}%` : "N/A"} hint="Across all graded work" icon={FiStar} tone="gold" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Recent Announcements">
          {data.announcements.length > 0 ? (
            <div className="space-y-4">
              {data.announcements.slice(0, 3).map((ann, i) => (
                <div key={i} className="border-l-4 border-teal-500 pl-4 py-2">
                  <h4 className="text-sm font-semibold text-gray-800">{ann.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(ann.date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FiBell} title="No Announcements" text="You are all caught up!" />
          )}
        </Panel>
        <Panel title="Upcoming Schedule">
          {data.schedule.length > 0 ? (
            <div className="space-y-4">
              {data.schedule.slice(0, 3).map((session, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-teal-50 text-teal-700 py-1 px-3 rounded flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-xs font-bold">{new Date(session.date).getDate()}</span>
                    <span className="text-[10px] uppercase">{new Date(session.date).toLocaleString("default", { month: "short" })}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">{session.topic}</h4>
                    <p className="text-xs text-gray-500">{session.time} &middot; {session.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FiClock} title="No Upcoming Sessions" text="Your schedule is clear." />
          )}
        </Panel>
      </div>
    </div>
  );
}

function GenericPage({ title, description, icon: Icon, children }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-teal-600 mb-2">
          <Icon size={20} />
          <span className="text-sm font-bold tracking-wider uppercase">Student Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  useEffect(() => {
    let alive = true;
    API.get("/student/dashboard")
      .then(({ data: response }) => {
        if (!alive || !response) return;
        setData({
          ...fallback,
          ...response,
          profile: { ...fallback.profile, ...(response.profile || {}) },
          stats: { ...fallback.stats, ...(response.stats || {}) },
          progress: Array.isArray(response.progress) ? response.progress : [],
          assignments: Array.isArray(response.assignments) ? response.assignments : [],
          announcements: Array.isArray(response.announcements) ? response.announcements : [],
          attendanceWeek: Array.isArray(response.attendanceWeek) ? response.attendanceWeek : [],
          schedule: Array.isArray(response.schedule) ? response.schedule : [],
          attendance: Array.isArray(response.attendance) ? response.attendance : [],
          grades: Array.isArray(response.grades) ? response.grades : [],
          achievements: Array.isArray(response.achievements) ? response.achievements : [],
          resources: Array.isArray(response.resources) ? response.resources : [],
        });
      })
      .catch(() => { if (alive) setData(fallback); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { path: "", label: "Dashboard", icon: FiGrid },
    { path: "progress", label: "My Courses/Tracks", icon: FiTrendingUp },
    { path: "assignments", label: "Assignments", icon: FiFileText },
    { path: "attendance", label: "My Attendance", icon: FiCheckSquare },
    { path: "profile", label: "Profile", icon: FiUser },
    { path: "settings", label: "Settings", icon: FiSettings },
  ];

  const profile = data.profile || fallback.profile;
  const name = profile.name || user.name || "Student";

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-teal-700">Loading your dashboard...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-teal-900 text-white shadow-xl fixed md:relative z-30 h-full flex flex-col justify-between transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div>
          <div className="p-6 border-b border-teal-800 flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-cover rounded-full bg-white p-1" />
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">ASTU MSJ<br/>Bootcamp System</h1>
            </div>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const fullPath = `/student-dashboard${item.path ? "/" + item.path : ""}`;
              const isActive = location.pathname === fullPath || (item.path === "" && location.pathname === "/student-dashboard");
              
              return (
                <Link
                  key={item.path}
                  to={fullPath}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-800 text-white border-l-4 border-white"
                      : "text-teal-100 hover:bg-teal-800/50 hover:text-white"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-white" : "text-teal-300"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-teal-800 bg-teal-950/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 text-sm hover:bg-red-500/10 hover:text-red-400 rounded-lg font-medium transition-colors mb-4"
          >
            <FiLogOut size={18} />
            Logout
          </button>
          <div className="flex items-center gap-3 px-2">
            <div className="bg-teal-800 p-2 rounded-full">
              <FiUser size={24} className="text-teal-200" />
            </div>
            <div>
              <p className="text-sm font-bold text-white truncate w-32">{name}</p>
              <p className="text-xs text-teal-300 capitalize">{profile.track || "Student"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-teal-900 text-white p-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8 object-cover rounded-full bg-white p-0.5" />
            <h1 className="font-bold text-sm">Student Portal</h1>
          </div>
          <button className="p-2 text-teal-100 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="" element={<DashboardHome data={data} stats={data.stats} profile={profile} />} />
            <Route path="attendance" element={
              <GenericPage title="My Attendance" description="Track your session attendance." icon={FiCheckSquare}>
                <Panel title="Attendance Records"><EmptyState icon={FiCheckSquare} title="No records found" text="Your attendance will be logged here." /></Panel>
              </GenericPage>
            } />
            <Route path="progress" element={
              <GenericPage title="My Courses & Tracks" description="Follow your learning progress." icon={FiTrendingUp}>
                <Panel title="Course Modules"><EmptyState icon={FiTrendingUp} title="No courses assigned" text="You have not started any modules yet." /></Panel>
              </GenericPage>
            } />
            <Route path="assignments" element={
              <GenericPage title="Assignments" description="View and submit your tasks." icon={FiFileText}>
                <Panel title="Pending Tasks"><EmptyState icon={FiFileText} title="All caught up!" text="No pending assignments." /></Panel>
              </GenericPage>
            } />
            <Route path="profile" element={
              <GenericPage title="My Profile" description="View your personal information." icon={FiUser}>
                <Panel title="Personal Details">
                  <div className="space-y-4 text-sm text-gray-700">
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Track:</strong> {profile.track || 'Unassigned'}</p>
                  </div>
                </Panel>
              </GenericPage>
            } />
            <Route path="settings" element={
              <GenericPage title="Settings" description="Manage your account preferences." icon={FiSettings}>
                <Panel title="Preferences"><EmptyState icon={FiSettings} title="Settings" text="Update your preferences here." /></Panel>
              </GenericPage>
            } />
            <Route path="*" element={<Navigate to="/student-dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
