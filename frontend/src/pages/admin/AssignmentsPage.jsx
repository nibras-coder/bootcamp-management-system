import React, { useState } from "react";
import { Plus, FileText, Clock, CheckCircle, X } from "lucide-react";

const initialAssignments = [
  {
    id: 1,
    title: "DSA Weekly Contest #1 (Codeforces)",
    batch: "DSA & Competitive Programming",
    dueDate: "2026-08-20",
    status: "Active",
    submissions: 32,
    total: 45,
  },
  {
    id: 2,
    title: "React UI Clone",
    batch: "Web Dev Bootcamp",
    dueDate: "2026-08-15",
    status: "Grading",
    submissions: 40,
    total: 45,
  },
  {
    id: 3,
    title: "Database Design",
    batch: "Backend Masterclass",
    dueDate: "2026-08-25",
    status: "Active",
    submissions: 10,
    total: 30,
  },
];

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    batch: "",
    dueDate: "",
    status: "Active",
    submissions: 0,
    total: 45,
  });
  const [activeGradingId, setActiveGradingId] = useState(null);

  const handleAddAssignment = (e) => {
    e.preventDefault();
    setAssignments([...assignments, { ...newAssignment, id: Date.now() }]);
    setIsModalOpen(false);
    setNewAssignment({
      title: "",
      batch: "",
      dueDate: "",
      status: "Active",
      submissions: 0,
      total: 45,
    });
  };

  const openGrading = (id) => {
    setActiveGradingId(id);
    setIsGradingModalOpen(true);
  };

  const completeGrading = () => {
    setAssignments(
      assignments.map((a) =>
        a.id === activeGradingId ? { ...a, status: "Completed" } : a,
      ),
    );
    setIsGradingModalOpen(false);
    setActiveGradingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Contests & Assignments
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <Plus size={18} />
          <span>New Contest/Assignment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Batch: {assignment.batch}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  assignment.status === "Active"
                    ? "bg-blue-100 text-blue-800"
                    : assignment.status === "Grading"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {assignment.status}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
              <div className="flex items-center space-x-1">
                <Clock size={16} className="text-gray-400" />
                <span>Due: {assignment.dueDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText size={16} className="text-gray-400" />
                <span>
                  {assignment.submissions} / {assignment.total} Submissions
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(assignment.submissions / assignment.total) * 100}%`,
                }}
              ></div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
              <button className="text-teal-600 font-medium text-sm hover:underline">
                View Details
              </button>
              {(assignment.status === "Active" ||
                assignment.status === "Grading") && (
                <button
                  onClick={() => openGrading(assignment.id)}
                  className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-teal-100"
                >
                  Grade Submissions
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Contest/Assignment
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="e.g. DSA Contest #3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Track
                </label>
                <select
                  required
                  value={newAssignment.batch}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      batch: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                >
                  <option value="">Select Track...</option>
                  <option value="Web Dev Bootcamp">Web Dev Bootcamp</option>
                  <option value="DSA & Competitive Programming">
                    DSA & Competitive Programming
                  </option>
                  <option value="Backend Masterclass">
                    Backend Masterclass
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline Date
                </label>
                <input
                  required
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attached File / Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  value={newAssignment.link || ""}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, link: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Score / Points
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="100"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  value={newAssignment.maxScore || ""}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, maxScore: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {isGradingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl text-center">
            <CheckCircle className="mx-auto text-teal-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Complete Grading?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              This will mark all submissions as graded and update the status to
              Completed.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsGradingModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={completeGrading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
