import { useState, useEffect } from "react";
import axios from "axios";
import { Users, TrendingUp, FileText, Star, Bell } from "lucide-react";
import Sidebar from "../components/mentor/Sidebar";
import StatCard from "../components/mentor/StatCard";
import AttendanceChart from "../components/mentor/AttendanceChart";
import StudentsAtRisk from "../components/mentor/StudentsAtRisk";
import RecentAssignments from "../components/mentor/RecentAssignments";
import QuickActions from "../components/mentor/QuickActions";

function MentorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/mentor/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, Yonas! Here's your batch overview.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600">
              May 15, 2026
            </div>

            <button className="relative bg-white p-2.5 rounded-lg shadow-sm hover:bg-gray-50">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          <StatCard label="My Students" value="32" sublabel="Total Students" icon={<Users size={18} className="text-teal-700" />} />
          <StatCard label="Attendance (Avg.)" value="86.2%" sublabel="This Week" icon={<TrendingUp size={18} className="text-teal-700" />} />
          <StatCard label="Pending Submissions" value="7" sublabel="Needs Review" icon={<FileText size={18} className="text-teal-700" />} />
          <StatCard label="Average Grade" value="84.1%" sublabel="This Batch" icon={<Star size={18} className="text-teal-700" />} />
        </div>

        {/* Chart + at-risk */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="col-span-2">
            <AttendanceChart />
          </div>
          <StudentsAtRisk />
        </div>

        {/* Assignments + quick actions */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <RecentAssignments />
          </div>
          <QuickActions />
        </div>
      </main>
    </div>
  );
}

export default MentorDashboard;