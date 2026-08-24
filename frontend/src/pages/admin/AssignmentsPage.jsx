import React, { useState, useEffect } from "react";
import { Plus, FileText, Clock, CheckCircle, X } from "lucide-react";
import API from "../../api/axios";

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    batch: "",
    deadline: "",
    maxScore: 100,
  });
  const [activeGradingId, setActiveGradingId] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchBatches();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await API.get("/assignments");
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await API.get("/batches");
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newAssignment.title,
        batch: newAssignment.batch,
        deadline: newAssignment.deadline,
        maxScore: newAssignment.maxScore,
        description: newAssignment.description || newAssignment.title, // Add default description if missing
        link: newAssignment.link,
      };

      const response = await API.post("/assignments", payload);
      if (response.data.success) {
        // Refresh assignments to get populated batch
        fetchAssignments();
        setIsModalOpen(false);
        setNewAssignment({
          title: "",
          description: "",
          batch: "",
          deadline: "",
          maxScore: 100,
          link: "",
        });
      }
    } catch (error) {
      console.error("Failed to add assignment:", error);
      alert(error.response?.data?.message || "Failed to add assignment");
    }
  };

  const openGrading = (id) => {
    setActiveGradingId(id);
    setIsGradingModalOpen(true);
  };

  const completeGrading = () => {
    // For now, since grade updating isn't fully set up in backend MVP,
    // just close the modal.
    setIsGradingModalOpen(false);
    setActiveGradingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
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
            key={assignment._id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Batch:{" "}
                  {assignment.batch?.name ||
                    assignment.batch?.track ||
                    "Unknown"}
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
                {assignment.status || "Active"}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4 space-x-4">
              <div className="flex items-center space-x-1">
                <Clock size={16} className="text-gray-400" />
                <span>
                  Due: {new Date(assignment.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText size={16} className="text-gray-400" />
                <span>{assignment.submissions || 0} Submissions</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
              {(assignment.status === "Active" ||
                assignment.status === "Grading" ||
                true) && (
                <button
                  onClick={() => openGrading(assignment._id)}
                  className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-100"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Add New Contest/Assignment
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name || b.track}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline Date
                </label>
                <input
                  required
                  type="date"
                  value={newAssignment.deadline}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      deadline: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Score/Points
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="20"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  value={newAssignment.maxScore || ""}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      maxScore: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-xl text-center">
            <CheckCircle className="mx-auto text-teal-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Complete Grading?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              This will mark all submissions as graded and update the status to
              Completed.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsGradingModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
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
