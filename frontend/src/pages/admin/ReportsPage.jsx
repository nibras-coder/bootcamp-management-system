import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Download,
  Loader,
  BookOpen,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const GENDER_COLORS = ["#0f766e", "#14b8a6", "#5eead4"];
const TRACK_COLORS = ["#134e4a", "#0f766e", "#14b8a6", "#0d9488", "#2dd4bf", "#5eead4"];

const ReportsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [studentsRes, mentorsRes, batchesRes, attendanceRes, assignmentsRes, submissionsRes] =
        await Promise.allSettled([
          API.get("/users/students"),
          API.get("/users?role=mentor"),
          API.get("/batches"),
          API.get("/attendance"),
          API.get("/assignments"),
          API.get("/submissions"),
        ]);

      if (studentsRes.status === "fulfilled" && studentsRes.value.data.success)
        setStudents(studentsRes.value.data.data || []);
      if (mentorsRes.status === "fulfilled" && mentorsRes.value.data.success)
        setMentors(mentorsRes.value.data.data || []);
      if (batchesRes.status === "fulfilled" && batchesRes.value.data.success)
        setBatches(batchesRes.value.data.data || []);
      if (attendanceRes.status === "fulfilled" && attendanceRes.value.data.success)
        setAttendance(attendanceRes.value.data.data || []);
      if (assignmentsRes.status === "fulfilled" && assignmentsRes.value.data.success)
        setAssignments(assignmentsRes.value.data.data || []);
      if (submissionsRes.status === "fulfilled" && submissionsRes.value.data.success)
        setSubmissions(submissionsRes.value.data.data || []);
    } catch (err) {
      console.error("Reports fetch error:", err);
      toast.error("Failed to load some report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── Computed Stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeBatches = batches.length;
    const totalMentors = mentors.length;

    // Attendance rate
    const presentCount = attendance.filter((a) => a.status === "Present").length;
    const attendanceRate = attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 0;

    // Assignment completion: graded submissions / total students * assignments
    const gradedSubs = submissions.filter((s) => s.status === "Graded" || s.grade != null).length;
    const completionRate = submissions.length > 0
      ? Math.round((gradedSubs / submissions.length) * 100)
      : 0;

    return { totalStudents, activeBatches, totalMentors, attendanceRate, completionRate };
  }, [students, batches, mentors, attendance, submissions]);

  // ─── Gender Distribution ──────────────────────────────────────────────────
  const genderData = useMemo(() => {
    const counts = {};
    students.forEach((s) => {
      const g = s.gender || "Unknown";
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [students]);

  // ─── Students by Track Bar Chart ─────────────────────────────────────────
  const trackData = useMemo(() => {
    const counts = {};
    batches.forEach((b) => { counts[b.name || b.track || "Track"] = 0; });
    students.forEach((s) => {
      const track = s.batch?.name || s.batch?.track || "Unassigned";
      counts[track] = (counts[track] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([batch, count]) => ({ batch, count }))
      .filter((d) => d.count > 0);
  }, [students, batches]);

  // ─── Attendance by Track ──────────────────────────────────────────────────
  const attendanceByTrack = useMemo(() => {
    const trackMap = {};
    attendance.forEach((rec) => {
      const trackName = rec.batch?.name || rec.batch?.track || "Unknown";
      if (!trackMap[trackName]) trackMap[trackName] = { present: 0, total: 0 };
      trackMap[trackName].total++;
      if (rec.status === "Present") trackMap[trackName].present++;
    });
    return Object.entries(trackMap).map(([batch, val]) => ({
      batch,
      rate: val.total > 0 ? Math.round((val.present / val.total) * 100) : 0,
    }));
  }, [attendance]);

  // ─── Top Performers by Attendance ─────────────────────────────────────────
  const topAttendance = useMemo(() => {
    const studentMap = {};
    attendance.forEach((rec) => {
      const id = rec.student?._id || rec.student;
      const name = rec.student?.name || "Unknown";
      const batch = rec.batch?.name || rec.batch?.track || "Unknown";
      if (!studentMap[id]) studentMap[id] = { name, batch, present: 0, total: 0 };
      studentMap[id].total++;
      if (rec.status === "Present") studentMap[id].present++;
    });
    return Object.values(studentMap)
      .map((s) => ({
        ...s,
        rate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [attendance]);

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const rows = [
        ["Name", "Email", "Gender", "Track", "Attendance %"],
        ...students.map((s) => {
          const id = s._id;
          const studentRecs = attendance.filter((a) => {
            const sid = a.student?._id || a.student;
            return String(sid) === String(id);
          });
          const presentRecs = studentRecs.filter((a) => a.status === "Present").length;
          const attRate = studentRecs.length > 0
            ? Math.round((presentRecs / studentRecs.length) * 100)
            : "N/A";
          return [
            s.name || "",
            s.email || "",
            s.gender || "",
            s.batch?.name || s.batch?.track || "Unassigned",
            attRate,
          ];
        }),
      ];

      const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bootcamp-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported as CSV successfully!");
    } catch (err) {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3 text-gray-400">
          <Loader className="animate-spin" size={36} />
          <p className="text-sm font-medium">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Live data from all bootcamp tracks</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAll}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {isExporting ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudents}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.activeBatches} active track{stats.activeBatches !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Avg. Attendance</h3>
            <div className="p-2 bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-lg">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.attendanceRate}%</p>
          <p className="text-xs text-gray-500 mt-2">{attendance.length} total records</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Grading Rate</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
              <Award size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completionRate}%</p>
          <p className="text-xs text-gray-500 mt-2">{submissions.length} submissions total</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Mentors</h3>
            <div className="p-2 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-lg">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalMentors}</p>
          <p className="text-xs text-gray-500 mt-2">{assignments.length} total assignments</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Track */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-5">
            Students by Track
          </h3>
          {trackData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trackData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="batch"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    dy={10}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    allowDecimals={false}
                    dx={-5}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "#f3f4f680" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value) => [value, "Students"]}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40}>
                    {trackData.map((_, i) => (
                      <Cell key={i} fill={TRACK_COLORS[i % TRACK_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No track data available
            </div>
          )}
        </div>

        {/* Gender Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-5">
            Student Gender Distribution
          </h3>
          {genderData.length > 0 ? (
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.totalStudents}</span>
                <span className="text-xs text-gray-500 font-medium mt-1">Total Students</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No gender data available
            </div>
          )}
        </div>
      </div>

      {/* Attendance by Track */}
      {attendanceByTrack.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-5">
            Attendance Rate by Track
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByTrack} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="batch"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  dy={8}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  domain={[0, 100]}
                  dx={-5}
                  tickFormatter={(v) => `${v}%`}
                />
                <RechartsTooltip
                  cursor={{ fill: "#f3f4f680" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => [`${value}%`, "Attendance Rate"]}
                />
                <Bar dataKey="rate" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two-column bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Attendance Performers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
            Top Attendance — Students
          </h3>
          {topAttendance.length > 0 ? (
            <ul className="space-y-3">
              {topAttendance.map((student, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-lg border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.batch}</p>
                    </div>
                  </div>
                  <div className={`font-bold px-3 py-1 rounded-full text-sm ${
                    student.rate >= 90
                      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300"
                      : student.rate >= 70
                        ? "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300"
                        : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                  }`}>
                    {student.rate}%
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No attendance records yet.</p>
          )}
        </div>

        {/* Assignments & Submissions Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
            Assignments Overview
          </h3>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.slice(0, 5).map((asg) => {
                const asgSubs = submissions.filter(
                  (s) => String(s.assignment?._id || s.assignment) === String(asg._id)
                );
                const graded = asgSubs.filter((s) => s.status === "Graded" || s.grade != null).length;
                const total = asgSubs.length;
                const pct = total > 0 ? Math.round((graded / total) * 100) : 0;

                return (
                  <div key={asg._id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{asg.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{asg.batch?.name || asg.batch?.track || "All Tracks"}</p>
                      </div>
                      <div className="ml-3 flex items-center space-x-1 flex-shrink-0">
                        {graded > 0 ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <Calendar size={14} className="text-gray-400" />
                        )}
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {graded}/{total} graded
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {assignments.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{assignments.length - 5} more assignments
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No assignments found.</p>
          )}
        </div>
      </div>

      {/* Batch Summary Table */}
      {batches.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Track Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3">Track</th>
                  <th className="px-6 py-3">Students</th>
                  <th className="px-6 py-3">Assignments</th>
                  <th className="px-6 py-3">Attendance Rate</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {batches.map((batch) => {
                  const batchStudents = students.filter(
                    (s) => String(s.batch?._id || s.batch) === String(batch._id)
                  );
                  const batchAssignments = assignments.filter(
                    (a) => String(a.batch?._id || a.batch) === String(batch._id)
                  );
                  const batchAttendance = attendance.filter(
                    (a) => String(a.batch?._id || a.batch) === String(batch._id)
                  );
                  const present = batchAttendance.filter((a) => a.status === "Present").length;
                  const attRate = batchAttendance.length > 0
                    ? Math.round((present / batchAttendance.length) * 100)
                    : null;

                  return (
                    <tr key={batch._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {batch.name || batch.track || "Unnamed"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{batchStudents.length}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{batchAssignments.length}</td>
                      <td className="px-6 py-4">
                        {attRate !== null ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 w-20">
                              <div
                                className={`h-1.5 rounded-full ${attRate >= 80 ? "bg-green-500" : attRate >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${attRate}%` }}
                              />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">{attRate}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No records</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
