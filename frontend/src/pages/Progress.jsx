import { useState } from "react";
import Sidebar from "../components/mentor/Sidebar";

const topics = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Git/GitHub",
];

const statusOptions = [
  "not_started",
  "in_progress",
  "completed",
  "needs_improvement",
];

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

const initialStudents = [
  {
    id: 1,
    name: "Aya Esmael",
    progress: {
      "HTML/CSS": "completed",
      JavaScript: "completed",
      React: "in_progress",
      "Node.js": "not_started",
      "Express.js": "not_started",
      MongoDB: "not_started",
      "Git/GitHub": "completed",
    },
  },
  {
    id: 2,
    name: "Meka Ali",
    progress: {
      "HTML/CSS": "completed",
      JavaScript: "needs_improvement",
      React: "not_started",
      "Node.js": "not_started",
      "Express.js": "not_started",
      MongoDB: "not_started",
      "Git/GitHub": "in_progress",
    },
  },
];

function Progress() {
  const [students, setStudents] = useState(initialStudents);
  const [selectedStudentId, setSelectedStudentId] = useState(
    initialStudents[0].id,
  );
  const [note, setNote] = useState("");

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleStatusChange = (topic, newStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudentId
          ? {
              ...student,
              progress: { ...student.progress, [topic]: newStatus },
            }
          : student,
      ),
    );
  };

  const handleSaveNote = () => {
    // TODO: send note + selectedStudentId to backend via POST /api/progress
    console.log("Saving note for", selectedStudent.name, note);
    alert("Note saved (not yet connected to backend)");
    setNote("");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Progress</h1>
        <p className="text-gray-500 text-sm mb-6">
          Track each student's progress by topic.
        </p>

        {/* Student selector */}
        <div className="flex gap-2 mb-6">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedStudentId === student.id
                  ? "bg-teal-800 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {student.name}
            </button>
          ))}
        </div>

        {/* Topic progress table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-normal">Topic</th>
                <th className="pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr
                  key={topic}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 text-gray-800 dark:text-gray-200">{topic}</td>
                  <td className="py-3">
                    <select
                      value={selectedStudent.progress[topic]}
                      onChange={(e) =>
                        handleStatusChange(topic, e.target.value)
                      }
                      className={`text-xs px-3 py-1.5 rounded-full border-0 ${statusColors[selectedStudent.progress[topic]]}`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {statusLabels[option]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Add a Note for {selectedStudent.name}
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Struggling with async/await, needs extra practice..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm"
          />
          <button
            onClick={handleSaveNote}
            className="mt-3 bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-teal-900"
          >
            Save Note
          </button>
        </div>
      </main>
    </div>
  );
}

export default Progress;
