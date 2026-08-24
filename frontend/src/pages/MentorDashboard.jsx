import { useState, useEffect } from "react";
import { Users, TrendingUp, FileText, Star, Bell } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/mentor/Sidebar";
import StatCard from "../components/mentor/StatCard";
import AttendanceChart from "../components/mentor/AttendanceChart";
import StudentsAtRisk from "../components/mentor/StudentsAtRisk";
import RecentAssignments from "../components/mentor/RecentAssignments";
import QuickActions from "../components/mentor/QuickActions";


function MentorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/mentor/dashboard");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to load mentor dashboard:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your dashboard. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // if (loading) {
  //   return <p className="p-8 text-gray-600 dark:text-gray-300">Loading dashboard...</p>;
  // }

  // if (error) {
  //   return <p className="p-8 text-red-600">{error}</p>;
  // }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:text-gray-100 relative">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-teal-900">ASTU MSJ</h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-gray-100 rounded-md text-gray-700 dark:text-gray-300"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar - hidden on mobile unless toggled */}
      <div
        className={`${
          sidebarOpen ? "fixed inset-0 z-50 flex" : "hidden"
        } md:flex md:relative md:w-64`}
      >
        <div className="w-64 h-full">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        {/* Overlay to close sidebar on mobile */}
        {sidebarOpen && (
          <div
            className="flex-1 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      <main className="flex-1 p-4 md:p-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mentor Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Welcome back, Amir! Here's your track overview.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600 dark:text-gray-300 border border-transparent dark:border-gray-700">
              May 15, 2026
            </div>

            <button className="relative bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700">
              <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 w-full">
          <StatCard
            label="My Students"
            value={stats?.studentsCount ?? 0}
            sublabel="Total Students"
            icon={<Users size={18} className="text-teal-700" />}
          />
          <StatCard
            label="Attendance (Avg.)"
            value={`${stats?.attendancePercentage ?? 0}%`}
            sublabel="This Week"
            icon={<TrendingUp size={18} className="text-teal-700" />}
          />
          <StatCard
            label="Pending Submissions"
            value={stats?.pendingSubmissions ?? 0}
            sublabel="Needs Review"
            icon={<FileText size={18} className="text-teal-700" />}
          />
          <StatCard
            label="Average Grade"
            value={`${stats?.averageGrade ?? 0}%`}
            sublabel="This Track"
            icon={<Star size={18} className="text-teal-700" />}
          />
        </div>

        {/* Chart + at-risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 w-full">
          <div className="lg:col-span-2 w-full">
            <AttendanceChart />
          </div>
          <div className="w-full">
            <StudentsAtRisk />
          </div>
        </div>

        {/* Assignments + quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
          <div className="lg:col-span-2 w-full">
            <RecentAssignments />
          </div>
          <div className="w-full">
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}

export default MentorDashboard;
