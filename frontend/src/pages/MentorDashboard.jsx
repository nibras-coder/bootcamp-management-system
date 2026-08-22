import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, FileText, Star, Bell } from "lucide-react";
import Sidebar from "../components/mentor/Sidebar";
import StatCard from "../components/mentor/StatCard";
import AttendanceChart from "../components/mentor/AttendanceChart";
import StudentsAtRisk from "../components/mentor/StudentsAtRisk";
import RecentAssignments from "../components/mentor/RecentAssignments";
import QuickActions from "../components/mentor/QuickActions";
import api from "../utils/api";

function MentorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
<<<<<<< HEAD
        const res = await api.get("/mentor/dashboard");
=======
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/mentor/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
>>>>>>> origin/main
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <p className="text-gray-500">Loading dashboard...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <p className="text-red-600">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
<<<<<<< HEAD
            <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back! Here's your batch overview.</p>
=======
            <h1 className="text-2xl font-bold text-gray-900">
              Mentor Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              Welcome back, Amir! Here's your track overview.
            </p>
>>>>>>> origin/main
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600">
              {today}
            </div>
            <button className="relative bg-white p-2.5 rounded-lg shadow-sm hover:bg-gray-50">
              <Bell size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* Stat cards — clickable shortcuts to related pages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <button onClick={() => navigate("/my-students")} className="text-left">
            <StatCard label="My Students" value={stats.myStudents} sublabel="Total Students" icon={<Users size={18} className="text-teal-700" />} />
          </button>
          <button onClick={() => navigate("/attendance")} className="text-left">
            <StatCard label="Attendance (Avg.)" value={`${stats.attendanceAvg}%`} sublabel="Overall" icon={<TrendingUp size={18} className="text-teal-700" />} />
          </button>
          <button onClick={() => navigate("/grading")} className="text-left">
            <StatCard label="Pending Submissions" value={stats.pendingSubmissions} sublabel="Needs Review" icon={<FileText size={18} className="text-teal-700" />} />
          </button>
          <button onClick={() => navigate("/grading")} className="text-left">
            <StatCard label="Average Grade" value={`${stats.averageGrade}%`} sublabel="This Batch" icon={<Star size={18} className="text-teal-700" />} />
          </button>
=======
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          <StatCard
            label="My Students"
            value="32"
            sublabel="Total Students"
            icon={<Users size={18} className="text-teal-700" />}
          />
          <StatCard
            label="Attendance (Avg.)"
            value="86.2%"
            sublabel="This Week"
            icon={<TrendingUp size={18} className="text-teal-700" />}
          />
          <StatCard
            label="Pending Submissions"
            value="7"
            sublabel="Needs Review"
            icon={<FileText size={18} className="text-teal-700" />}
          />
          <StatCard
            label="Average Grade"
            value="84.1%"
            sublabel="This Track"
            icon={<Star size={18} className="text-teal-700" />}
          />
>>>>>>> origin/main
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2">
            <AttendanceChart data={stats.attendanceOverTime} />
          </div>
          <StudentsAtRisk students={stats.studentsAtRisk} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RecentAssignments assignments={stats.recentAssignments} />
          </div>
          <QuickActions />
        </div>
      </main>
    </div>
  );
}

export default MentorDashboard;
