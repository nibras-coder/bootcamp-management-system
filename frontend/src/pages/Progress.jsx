import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";

const topics = ["HTML/CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "Git/GitHub"];
const statusOptions = ["not_started", "in_progress", "completed", "needs_improvement"];
const statusLabels = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  needs_improvement: "Needs Improvement",
};
const statusColors = {
  not_started: "bg-gray-100 text-gray-500",
  in_progress: "bg-orange-50 text-orange-500",
  completed: "bg-teal-50 text-teal-700",
  needs_improvement: "bg-red-50 text-red-600",
};

function Progress() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [progressMap, setProgressMap] = useState({}); // { topic: status }
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/users", { params: { role: "student" } });
        setStudents(res.data.users);
        if (res.data.users.length > 0) setSelectedStudentId(res.data.users[0]._id);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load students" });
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchProgress = async () => {
      try {
        const res = await api.get("/progress", { params: { student: selectedStudentId } });
        const map = {};
        res.data.records.forEach((r) => { map[r.topic] = r.status; });
        setProgressMap(map);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load progress" });
      }
    };
    fetchProgress();
  }, [selectedStudentId]);

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  const handleStatusChange = async (topic, newStatus) => {
    setProgressMap((prev) => ({ ...prev, [topic]: newStatus }));
    try {
      await api.put("/progress", {
        student: selectedStudentId,
        batch: selectedStudent?.batch,
        topic,
        status: newStatus,
      });
    } catch (err) {
      setToast({ type: "error", message: "Failed to update progress" });
    }
  };

  const handleSaveNote = async () => {
    try {
      // Notes are saved per-topic in this simplified model; using the first topic as a general note slot
      await api.put("/progress", {
        student: selectedStudentId,
        batch: selectedStudent?.batch,
        topic: topics[0],
        status: progressMap[topics[0]] || "not_started",
        notes: note,
      });
      setToast({ type: "success", message: "Note saved" });
      setNote("");
    } catch (err) {
      setToast({ type: "error", message: "Failed to save note" });
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8"><p className="text-gray-500">Loading...</p></main>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Progress</h1>
        <p className="text-gray-500 text-sm mb-6">Track each student's progress by topic.</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {students.map((student) => (
            <button
              key={student._id}
              onClick={() => setSelectedStudentId(student._id)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedStudentId === student._id
                  ? "bg-teal-800 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {student.name}
            </button>
          ))}
        </div>

        {selectedStudent && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-normal">Topic</th>
                    <th className="pb-3 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic) => (
                    <tr key={topic} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-gray-800">{topic}</td>
                      <td className="py-3">
                        <select
                          value={progressMap[topic] || "not_started"}
                          onChange={(e) => handleStatusChange(topic, e.target.value)}
                          className={`text-xs px-3 py-1.5 rounded-full border-0 ${statusColors[progressMap[topic] || "not_started"]}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>{statusLabels[option]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Add a Note for {selectedStudent.name}</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Struggling with async/await, needs extra practice..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
              />
              <button
                onClick={handleSaveNote}
                className="mt-3 bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-teal-900"
              >
                Save Note
              </button>
            </div>
          </>
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default Progress;
