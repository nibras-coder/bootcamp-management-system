import { useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import { X } from "lucide-react";

const initialSubmissions = [
  {
    id: 1,
    student: "Abel Tesfaye",
    assignment: "React Components",
    githubUrl: "https://github.com/abel/react-components",
    liveDemoUrl: "https://abel-demo.vercel.app",
    notes: "Used custom hooks for state management.",
    status: "submitted",
    score: null,
    feedback: "",
  },
  {
    id: 2,
    student: "Mekdes Alemu",
    assignment: "API Integration",
    githubUrl: "https://github.com/mekdes/api-integration",
    liveDemoUrl: "",
    notes: "",
    status: "submitted",
    score: null,
    feedback: "",
  },
  {
    id: 3,
    student: "Daniel Worku",
    assignment: "React Components",
    githubUrl: "https://github.com/daniel/react-components",
    liveDemoUrl: "https://daniel-demo.vercel.app",
    notes: "Deployed a bit late, sorry!",
    status: "graded",
    score: 88,
    feedback: "Great work, clean components.",
  },
];

const statusColors = {
  submitted: "bg-orange-50 text-orange-500",
  graded: "bg-teal-50 text-teal-700",
  resubmission_requested: "bg-red-50 text-red-600",
};

function Grading() {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

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

  const handleGrade = (newStatus) => {
    // TODO: send { score, feedback, status } to backend via PUT /api/submissions/:id
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === selected.id
          ? { ...sub, score: score ? Number(score) : null, feedback, status: newStatus }
          : sub
      )
    );
    closeModal();
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Grading</h1>
        <p className="text-gray-500 text-sm mb-6">Review and grade student submissions.</p>

        <div className="bg-white rounded-xl shadow-sm p-5">
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
                <tr key={sub.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-800">{sub.student}</td>
                  <td className="py-3 text-gray-600">{sub.assignment}</td>
                  <td className="py-3 text-gray-600">{sub.score ?? "—"}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[sub.status]}`}>
                      {sub.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openSubmission(sub)}
                      className="text-teal-700 text-sm hover:underline"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Review modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">
                  {selected.student} — {selected.assignment}
                </h3>
                <button onClick={closeModal}>
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p>
                  <span className="text-gray-500">GitHub: </span>
                  <a href={selected.githubUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                    {selected.githubUrl}
                  </a>
                </p>
                {selected.liveDemoUrl && (
                  <p>
                    <span className="text-gray-500">Live Demo: </span>
                    <a href={selected.liveDemoUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                      {selected.liveDemoUrl}
                    </a>
                  </p>
                )}
                {selected.notes && (
                  <p>
                    <span className="text-gray-500">Student Notes: </span>
                    {selected.notes}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Score</label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Write feedback for the student..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleGrade("graded")}
                    className="flex-1 bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900"
                  >
                    Save Grade
                  </button>
                  <button
                    onClick={() => handleGrade("resubmission_requested")}
                    className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-lg text-sm hover:bg-red-50"
                  >
                    Request Resubmission
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Grading;