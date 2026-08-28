import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Calendar, Save, CheckCircle, Users, Loader2, Check, X, Clock , Menu } from "lucide-react";

const statusOptions = ["Present", "Absent", "Late", "Excused"];

const statusColors = {
  Present: "bg-teal-500 text-white font-semibold shadow-sm",
  Absent: "bg-red-500 text-white font-semibold shadow-sm",
  Late: "bg-orange-500 text-white font-semibold shadow-sm",
  Excused: "bg-gray-500 text-white font-semibold shadow-sm",
};

function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [studentsRes, batchesRes] = await Promise.all([
          API.get("/mentor/students"),
          API.get("/batches"),
        ]);
        if (studentsRes.data.success) {
          setStudents(studentsRes.data.data || []);
        }
        if (batchesRes.data.success) {
          const list = batchesRes.data.data || [];
          setBatches(list);
          if (list.length > 0) setSelectedBatch(list[0]._id);
        }
      } catch (err) {
        console.error("Init attendance error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch existing attendance records for the selected date
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await API.get("/attendance");
        if (res.data.success && Array.isArray(res.data.data)) {
          const recordsForDate = res.data.data.filter((r) => {
            const rDate = r.date ? new Date(r.date).toISOString().split("T")[0] : "";
            return rDate === date;
          });
          const map = {};
          recordsForDate.forEach((r) => {
            const sid = r.student?._id || r.student;
            map[sid] = r.status;
          });
          setAttendanceMap(map);
        }
      } catch (err) {}
    };
    fetchExisting();
  }, [date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const newMap = { ...attendanceMap };
    students.forEach((s) => {
      newMap[s._id] = status;
    });
    setAttendanceMap(newMap);
  };

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
        batchId: selectedBatch,
        date,
        records,
      });

      if (res.data.success) {
        toast.success(`Attendance saved for ${date}! (${res.data.data.length} records marked)`);
        if (res.data.errors && res.data.errors.length > 0) {
          toast.warning(`Some records failed to save. Check console for details.`);
          console.warn("Attendance errors:", res.data.errors);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance records");
      console.error("Save attendance error:", err);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => (attendanceMap[s._id] || "Present") === "Present").length;
  const attendancePercent = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 overflow-y-auto">
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
            <span className="font-bold text-sm">Attendance</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Calendar className="text-teal-600 dark:text-teal-400" size={26} />
              Track Attendance
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Record and review daily attendance for your students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Attendance</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Session Attendance</span>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">{attendancePercent}%</p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-xl">
              <CheckCircle size={22} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Present Today</span>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {presentCount} / {students.length}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 text-green-600 rounded-xl">
              <Users size={22} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-medium">Quick Batch Action</span>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll("Present")}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll("Absent")}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100"
                >
                  All Absent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Student Attendance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
              Students Roster ({students.length})
            </h3>
            <span className="text-xs text-gray-400">Date: {date}</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={28} />
              <p className="text-sm">Loading attendance list...</p>
            </div>
          ) : students.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Track</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {students.map((student) => {
                    const currentStatus = attendanceMap[student._id] || "Present";
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                              {(student.name || "S").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</p>
                              <p className="text-xs text-gray-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {student.batch?.name || student.batch?.track || "Active Track"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1.5">
                            {statusOptions.map((option) => {
                              const isSelected = currentStatus === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => handleStatusChange(student._id, option)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    isSelected
                                      ? statusColors[option]
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
            <div className="py-12 text-center text-gray-400 text-sm">
              No students found for this track.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Attendance;
