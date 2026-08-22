import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";
import { X } from "lucide-react";

const statusColors = {
  submitted: "bg-orange-50 text-orange-500",
  graded: "bg-teal-50 text-teal-700",
  resubmission_requested: "bg-red-50 text-red-600",
};

function Grading() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get("/submissions");
        setSubmissions(res.data.submissions);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load submissions" });
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const openSubmission = (submission) => {
    setSelected(submission);
    setScore(submission.score ?? "");
    setFeedback(submission.feedback ?? "");
  };

  const closeModal = () => {
    setSelected(null);
    setScore("");
    setFeedback("");
  };

  const handleGrade = async (newStatus) => {
    try {
      const res = await api.put(`/submissions/${selected._id}`, {
        score: score ? Number(score) : null,
        feedback,
        status: newStatus,
      });
      setSubmissions((prev) => prev.map((s) => (s._id === selected._id ? res.data.submission : s)));
      setToast({ type: "success", message: "Submission graded" });
      closeModal();
    } catch (err) {
      setToast({ type: "error", message: "Failed to save grade" });
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Grading</h1>
        <p className="text-gray-500 text-sm mb-6">Review and grade student submissions.</p>

        <div className="bg-white rounded-xl shadow-sm p-5">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-normal">Student</th>
                  <th className="pb-3 font-normal">Assignment</th>
                  <th className="pb-3 font-normal">Score</th>
                  <th className="pb-3 font-normal">Status</th>
                  <th className="pb-3 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-800">{sub.student?.name}</td>
                    <td className="py-3 text-gray-600">{sub.assignment?.title}</td>
                    <td className="py-3 text-gray-600">{sub.score ?? "—"}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[sub.status]}`}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => openSubmission(sub)} className="text-teal-700 text-sm hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && submissions.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No submissions yet.</p>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">{selected.student?.name} — {selected.assignment?.title}</h3>
                <button onClick={closeModal}><X size={18} className="text-gray-400" /></button>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p><span className="text-gray-500">GitHub: </span>
                  <a href={selected.githubUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">{selected.githubUrl}</a>
                </p>
                {selected.liveDemoUrl && (
                  <p><span className="text-gray-500">Live Demo: </span>
                    <a href={selected.liveDemoUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">{selected.liveDemoUrl}</a>
                  </p>
                )}
                {selected.notes && <p><span className="text-gray-500">Student Notes: </span>{selected.notes}</p>}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Score</label>
                  <input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g. 85" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Feedback</label>
                  <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Write feedback for the student..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleGrade("graded")} className="flex-1 bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900">Save Grade</button>
                  <button onClick={() => handleGrade("resubmission_requested")} className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-lg text-sm hover:bg-red-50">Request Resubmission</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default Grading;
