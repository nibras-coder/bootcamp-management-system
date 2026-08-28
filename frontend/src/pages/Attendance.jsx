import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import {
  Calendar,
  Save,
  CheckCircle,
  Users,
  Loader2,
  Check,
  X,
  Clock,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  History,
  RotateCcw,
  UserCheck,
  UserX,
} from "lucide-react";

const statusOptions = ["Present", "Absent", "Late", "Excused"];

const statusColors = {
  Present: "bg-teal-600 text-white font-bold shadow-sm ring-2 ring-teal-600/30",
  Absent: "bg-red-500 text-white font-bold shadow-sm ring-2 ring-red-500/30",
  Late: "bg-amber-500 text-white font-bold shadow-sm ring-2 ring-amber-500/30",
  Excused: "bg-gray-500 text-white font-bold shadow-sm ring-2 ring-gray-500/30",
};

// Helper: Normalize date strings to "YYYY-MM-DD"
const normalizeDateStr = (dateInput) => {
  if (!dateInput) return "";
  if (typeof dateInput === "string" && dateInput.length >= 10 && dateInput[4] === "-" && dateInput[7] === "-") {
    return dateInput.slice(0, 10);
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: Format date for display (e.g. "Thursday, Aug 28, 2026")
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [attendanceMap, setAttendanceMap] = useState({});
  const [hasExistingRecords, setHasExistingRecords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  // 1. Initial Load: Fetch Mentor Students, Batches, and All Attendance Records
  const fetchAllData = async () => {
    try {
      const [studentsRes, batchesRes, attRes] = await Promise.all([
        API.get("/mentor/students"),
        API.get("/batches"),
        API.get("/attendance"),
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data || []);
      }
      if (batchesRes.data.success) {
        setBatches(batchesRes.data.data || []);
      }
      if (attRes.data.success && Array.isArray(attRes.data.data)) {
        setAllAttendanceRecords(attRes.data.data);
      }
    } catch (err) {
      console.error("Init attendance error:", err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 2. Extract all distinct recorded session dates for the quick history pills
  const recordedSessionDates = useMemo(() => {
    const dateSet = new Set();
    allAttendanceRecords.forEach((r) => {
      const norm = normalizeDateStr(r.date);
      if (norm) dateSet.add(norm);
    });
    return Array.from(dateSet).sort((a, b) => (a < b ? 1 : -1));
  }, [allAttendanceRecords]);

  // 3. When Date changes or attendance records update: filter and populate statuses
  useEffect(() => {
    setDateLoading(true);

    const matchingRecords = allAttendanceRecords.filter((r) => {
      const rDateNorm = normalizeDateStr(r.date);
      return rDateNorm === date;
    });

    const isRecorded = matchingRecords.length > 0;
    setHasExistingRecords(isRecorded);

    const map = {};
    if (isRecorded) {
      // Populate with saved statuses from DB
      matchingRecords.forEach((r) => {
        const sId = String(r.student?._id || r.student);
        map[sId] = r.status || "Present";
      });
      // For any student not explicitly listed in that past session, default to "Present"
      students.forEach((s) => {
        if (!map[s._id]) map[s._id] = "Present";
      });
    } else {
      // Default all students to "Present" for a fresh date
      students.forEach((s) => {
        map[s._id] = "Present";
      });
    }

    setAttendanceMap(map);
    setDateLoading(false);
  }, [date, allAttendanceRecords, students]);

  // 4. Date Navigation Helpers (Previous Day, Next Day, Today)
  const handleShiftDate = (daysOffset) => {
    const [y, m, d] = date.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    target.setDate(target.getDate() + daysOffset);

    const newY = target.getFullYear();
    const newM = String(target.getMonth() + 1).padStart(2, "0");
    const newD = String(target.getDate()).padStart(2, "0");
    setDate(`${newY}-${newM}-${newD}`);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const newMap = { ...attendanceMap };
    filteredStudents.forEach((s) => {
      newMap[s._id] = status;
    });
    setAttendanceMap(newMap);
  };

  // 5. Save or Update Attendance for the Selected Date
  const handleSave = async () => {
    if (!students.length) {
      toast.warning("No students available to mark attendance");
      return;
    }
    setSaving(true);
    try {
      const records = students.map((student) => ({
        student: student._id,
        status: attendanceMap[student._id] || "Present",
      }));

      const res = await API.post("/attendance", {
        batchId: selectedBatch !== "all" ? selectedBatch : undefined,
        date,
        records,
      });

      if (res.data.success) {
        toast.success(
          `Attendance successfully saved for ${formatDisplayDate(date)}! (${res.data.data.length} students recorded)`
        );

        // Refresh global attendance records from server
        const refreshRes = await API.get("/attendance");
        if (refreshRes.data.success && Array.isArray(refreshRes.data.data)) {
          setAllAttendanceRecords(refreshRes.data.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance records");
      console.error("Save attendance error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Filter students based on search and selected batch
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batch?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batch?.track?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBatch =
        selectedBatch === "all" ||
        String(s.batch?._id || s.batch) === String(selectedBatch);

      return matchesSearch && matchesBatch;
    });
  }, [students, searchQuery, selectedBatch]);

  // Statistics for the currently selected date
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    filteredStudents.forEach((s) => {
      const st = attendanceMap[s._id] || "Present";
      if (st === "Present") present++;
      else if (st === "Absent") absent++;
      else if (st === "Late") late++;
      else if (st === "Excused") excused++;
    });

    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, excused, percent };
  }, [filteredStudents, attendanceMap]);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 dark:text-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-teal-900 dark:bg-black text-white mb-5 rounded-xl border border-teal-800 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-teal-800 text-teal-200"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold text-sm">Attendance Portal</span>
          </div>
        </div>

        {/* Page Header + Interactive Date Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-teal-600 dark:text-teal-400" size={26} />
                Attendance Tracker
              </h1>
              {hasExistingRecords ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1 shadow-xs">
                  <CheckCircle size={12} /> Saved Session
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 shadow-xs">
                  <AlertCircle size={12} /> New / Unrecorded
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Review, record, and edit daily student attendance for any date.
            </p>
          </div>

          {/* Date Picker & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            {/* Previous Day */}
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              title="Previous Day"
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Date Input */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-teal-300 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
              />
            </div>

            {/* Next Day */}
            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              title="Next Day"
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>

            {/* Jump to Today button if not on today */}
            {date !== todayStr && (
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-700 text-teal-700 dark:text-teal-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Today</span>
              </button>
            )}

            {/* Save / Update Attendance Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !students.length}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{hasExistingRecords ? "Update Attendance" : "Save Attendance"}</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Cards for the Selected Date */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          {/* Attendance Rate */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Session Rate</span>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                {stats.percent}%
              </p>
            </div>
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
              <CheckCircle size={22} />
            </div>
          </div>

          {/* Present Count */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Present</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.present}{" "}
                <span className="text-xs text-gray-400 font-normal">/ {stats.total}</span>
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <UserCheck size={22} />
            </div>
          </div>

          {/* Absent Count */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Absent</span>
              <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">
                {stats.absent}
              </p>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl">
              <UserX size={22} />
            </div>
          </div>

          {/* Late / Excused Count */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Late / Excused</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {stats.late + stats.excused}
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Filter and Bulk Action Controls */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 mb-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search and Batch Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>

            {batches.length > 1 && (
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-gray-100 cursor-pointer"
              >
                <option value="all">All Tracks</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name || b.track}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
            <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
              Quick Set:
            </span>
            <button
              type="button"
              onClick={() => handleMarkAll("Present")}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/60 transition-colors cursor-pointer"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll("Absent")}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/60 transition-colors cursor-pointer"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Student Attendance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/80">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                Students Roster ({filteredStudents.length})
              </h3>
              {dateLoading && <Loader2 size={14} className="animate-spin text-teal-600" />}
            </div>
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/60">
              {formatDisplayDate(date)}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={32} />
              <p className="text-xs">Loading students & attendance data...</p>
            </div>
          ) : filteredStudents.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Track / Cohort</th>
                    <th className="px-6 py-3.5 text-center">Status for {formatDisplayDate(date)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredStudents.map((student) => {
                    const currentStatus = attendanceMap[student._id] || "Present";
                    return (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {(student.name || "S").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {student.batch?.name || student.batch?.track || "Active Cohort"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1.5 flex-wrap">
                            {statusOptions.map((option) => {
                              const isSelected = currentStatus === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => handleStatusChange(student._id, option)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    isSelected
                                      ? statusColors[option]
                                      : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 text-sm">
              <Users size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="font-semibold text-gray-600 dark:text-gray-300">No students found</p>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery ? "Try adjusting your search criteria" : "No students currently assigned to this track."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Attendance;
