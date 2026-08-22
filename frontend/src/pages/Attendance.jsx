import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";

const statusOptions = ["present", "absent", "late", "excused"];
const statusColors = {
  present: "bg-teal-50 text-teal-700",
  absent: "bg-red-50 text-red-600",
  late: "bg-orange-50 text-orange-500",
  excused: "bg-gray-100 text-gray-600",
};

function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
  const [myBatchId, setMyBatchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await api.get("/users", { params: { role: "student" } });
        setStudents(studentsRes.data.users);
        if (studentsRes.data.users[0]?.batch) setMyBatchId(studentsRes.data.users[0].batch);

        const attendanceRes = await api.get("/attendance", { params: { date } });
        const map = {};
        attendanceRes.data.records.forEach((r) => {
          map[r.student._id] = r.status;
        });
        setAttendanceMap(map);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load attendance" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const entries = students.map((s) => ({
      student: s._id,
      status: attendanceMap[s._id] || "present",
    }));

    try {
      await api.post("/attendance", { batch: myBatchId, date, entries });
      setToast({ type: "success", message: "Attendance saved successfully" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to save attendance" });
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === "present").length;
  const attendancePercent = students.length ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-500 text-sm">Mark attendance for your batch.</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <p className="text-sm text-gray-500">
            Present: <span className="font-semibold text-teal-700">{presentCount}/{students.length}</span> ({attendancePercent}%)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-normal">Student</th>
                  <th className="pb-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-800">{student.name}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {statusOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleStatusChange(student._id, option)}
                            className={`px-3 py-1 rounded-full text-xs capitalize ${
                              (attendanceMap[student._id] || "present") === option
                                ? statusColors[option]
                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button
            onClick={handleSave}
            className="mt-5 bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-teal-900"
          >
            Save Attendance
          </button>
        </div>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default Attendance;
