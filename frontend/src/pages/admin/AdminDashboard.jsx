import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserSquare2,
  Layers,
  TrendingUp,
  Clock,
  CalendarDays,
  FileEdit,
  Mic,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    mentorsCount: 0,
    batchesCount: 0,
    attendanceAvg: 0,
  });
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, mentorsRes, batchesRes, announcementsRes, assignmentsRes, attendanceRes] =
          await Promise.allSettled([
            API.get("/users/students"),
            API.get("/users?role=mentor"),
            API.get("/batches"),
            API.get("/announcements/all"),
            API.get("/assignments"),
            API.get("/attendance"),
          ]);

        const studentsList =
          studentsRes.status === "fulfilled" && studentsRes.value.data.success
            ? studentsRes.value.data.data
            : [];
        const mentors =
          mentorsRes.status === "fulfilled" && mentorsRes.value.data.success
            ? mentorsRes.value.data.data
            : [];
        const batchList =
          batchesRes.status === "fulfilled" && batchesRes.value.data.success
            ? batchesRes.value.data.data
            : [];
        const announcements =
          announcementsRes.status === "fulfilled" && announcementsRes.value.data.success
            ? announcementsRes.value.data.data
            : [];
        const assignments =
          assignmentsRes.status === "fulfilled" && assignmentsRes.value.data.success
            ? assignmentsRes.value.data.data
            : [];
        const attendanceList =
          attendanceRes.status === "fulfilled" && attendanceRes.value.data.success
            ? attendanceRes.value.data.data
            : [];

        // Calculate attendance average
        let avg = 0;
        if (attendanceList.length > 0) {
          const present = attendanceList.filter((a) => a.status === "Present").length;
          avg = Math.round((present / attendanceList.length) * 100);
        } else {
          avg = 0;
        }

        setStats({
          studentsCount: studentsList.length,
          mentorsCount: mentors.length,
          batchesCount: batchList.length,
          attendanceAvg: avg,
        });

        setStudents(studentsList);
        setBatches(batchList);
        setAttendanceRecords(attendanceList);
        setRecentAnnouncements(announcements.slice(0, 3));
        setRecentAssignments(assignments.slice(0, 4));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Generate last 7 days dynamically from real attendance
  const attendanceData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dayRecords = attendanceRecords.filter((r) => {
        const rDate = r.date ? new Date(r.date).toISOString().split("T")[0] : "";
        return rDate === dateStr;
      });

      let rate = 0;
      if (dayRecords.length > 0) {
        const present = dayRecords.filter((r) => r.status === "Present").length;
        rate = Math.round((present / dayRecords.length) * 100);
      } else {
        rate = stats.attendanceAvg || 0;
      }

      data.push({ name: dayLabel, pv: rate });
    }
    return data;
  }, [attendanceRecords, stats.attendanceAvg]);

  // Compute actual student counts grouped by track
  const batchData = useMemo(() => {
    if (batches.length === 0 && students.length === 0) {
      return [{ name: "No Track Yet", value: 0 }];
    }

    const counts = {};
    batches.forEach((b) => {
      counts[b.name || b.track || "Track"] = 0;
    });

    students.forEach((st) => {
      const trackName = st.batch?.name || st.batch?.track || "Unassigned";
      counts[trackName] = (counts[trackName] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([name, value]) => ({
      name,
      value: value || 0,
    }));

    return entries.length > 0 ? entries : [{ name: "All Students", value: students.length || 0 }];
  }, [batches, students]);

  const COLORS = ["#134e4a", "#14b8a6", "#0f766e", "#5eead4", "#0d9488", "#2dd4bf"];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
              {stats.studentsCount}
            </h3>
            <p className="text-xs font-medium text-green-500 mt-2">
              Active enrolled
            </p>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg text-teal-600 dark:text-teal-400">
            <Users size={24} />
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Mentors</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
              {stats.mentorsCount}
            </h3>
            <p className="text-xs font-medium text-green-500 mt-2">
              Instructors & TAs
            </p>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg text-teal-600 dark:text-teal-400">
            <UserSquare2 size={24} />
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Tracks</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
              {stats.batchesCount}
            </h3>
            <p className="text-xs font-medium text-teal-500 mt-2">Active cohorts</p>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg text-teal-600 dark:text-teal-400">
            <Layers size={24} />
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Attendance (Avg.)
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
              {stats.attendanceAvg}%
            </h3>
            <p className="text-xs font-medium text-green-500 mt-2">
              Overall rate
            </p>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg text-teal-600 dark:text-teal-400">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Attendance Overview
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  domain={[0, 100]}
                  dx={-10}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [`${value}%`, "Attendance"]}
                />
                <Line
                  type="monotone"
                  dataKey="pv"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#fff",
                    stroke: "#0f766e",
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#0f766e",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Students by Track
          </h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={batchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {batchData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 leading-none">
                  {stats.studentsCount}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">
                  Total Students
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {batchData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Recent Announcements
            </h3>
            <button
              onClick={() => (window.location.href = "/admin/announcements")}
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View All
            </button>
          </div>
          <div className="p-5 flex-1 space-y-4">
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((ann) => (
                <div key={ann._id} className="flex items-start space-x-3">
                  <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-lg mt-0.5 flex-shrink-0">
                    <Mic size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {ann.content}
                    </p>
                    <div className="flex items-center space-x-1 mt-1 text-[11px] text-gray-400 font-medium">
                      <Clock size={11} />
                      <span>{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : "Recent"}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No announcements yet.</p>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Recent Assignments
            </h3>
            <button
              onClick={() => (window.location.href = "/admin/assignments")}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              View All
            </button>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3 px-5">Title</th>
                  <th className="py-3 px-5">Track</th>
                  <th className="py-3 px-5">Deadline</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                {recentAssignments.length > 0 ? (
                  recentAssignments.map((asg) => (
                    <tr key={asg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-5">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {asg.title}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-600 dark:text-gray-300">
                        {asg.batch?.name || asg.batch?.track || "All"}
                      </td>
                      <td className="py-3 px-5 text-gray-600 dark:text-gray-300">
                        {asg.deadline ? new Date(asg.deadline).toLocaleDateString() : "None"}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-sm text-gray-400">
                      No assignments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
