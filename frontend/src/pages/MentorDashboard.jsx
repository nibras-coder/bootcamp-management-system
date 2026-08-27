import { useState, useEffect } from "react";
import { Users, TrendingUp, FileText, Star, Bell, Loader2, AlertCircle, RefreshCw, Menu } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/mentor/Sidebar";
import StatCard from "../components/mentor/StatCard";
import AttendanceChart from "../components/mentor/AttendanceChart";
import StudentsAtRisk from "../components/mentor/StudentsAtRisk";
import RecentAssignments from "../components/mentor/RecentAssignments";
import QuickActions from "../components/mentor/QuickActions";
import NotificationDropdown from "../components/NotificationDropdown";

function MentorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/mentor/dashboard");
      if (res.data && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load mentor dashboard:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your dashboard data. Please check your connection and retry."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      {/* Fixed/Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-teal-900 dark:bg-black text-white mb-5 rounded-xl border border-teal-800 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-teal-800 text-teal-200"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold text-sm">Mentor Portal</span>
          </div>
          <span className="text-xs text-teal-300 font-medium">{user.name || "Mentor"}</span>
        </div>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Mentor Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Welcome back, {user.name || "Mentor"}! Here's your track overview and student analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {todayStr}
            </div>

            <NotificationDropdown />

            <button
              onClick={fetchDashboard}
              title="Refresh Data"
              className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-teal-600" : ""} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-6 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between gap-4 my-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="flex-shrink-0" />
              <div>
                <strong className="block text-sm font-bold">Failed to load Dashboard</strong>
                <span className="text-xs">{error}</span>
              </div>
            </div>
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="py-24 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-3 text-teal-600" size={32} />
            <p className="text-sm font-medium">Loading your dashboard analytics...</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 w-full">
              <StatCard
                label="My Students"
                value={stats?.studentsCount ?? 0}
                sublabel="Total Assigned Students"
                icon={<Users size={18} className="text-teal-600 dark:text-teal-400" />}
              />
              <StatCard
                label="Attendance Rate"
                value={`${stats?.attendancePercentage ?? 0}%`}
                sublabel="Overall Cohort"
                icon={<TrendingUp size={18} className="text-teal-600 dark:text-teal-400" />}
              />
              <StatCard
                label="Pending Submissions"
                value={stats?.pendingSubmissions ?? 0}
                sublabel="Needs Grading"
                icon={<FileText size={18} className="text-teal-600 dark:text-teal-400" />}
              />
              <StatCard
                label="Average Grade"
                value={`${stats?.averageGrade ?? 0}%`}
                sublabel="Cohort Performance"
                icon={<Star size={18} className="text-teal-600 dark:text-teal-400" />}
              />
            </div>

            {/* Chart + at-risk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 w-full">
              <div className="lg:col-span-2 w-full min-w-0">
                <AttendanceChart data={stats?.attendanceOverview} />
              </div>
              <div className="w-full min-w-0">
                <StudentsAtRisk students={stats?.studentsAtRisk || []} />
              </div>
            </div>

            {/* Assignments + quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
              <div className="lg:col-span-2 w-full min-w-0">
                <RecentAssignments assignments={stats?.pendingGrading || []} />
              </div>
              <div className="w-full min-w-0">
                <QuickActions />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MentorDashboard;
