import React, { useState, useEffect } from "react";
import { Plus, FileText, Clock, CheckCircle, X, Edit, Trash2 } from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const AssignmentsPage = () => {
  const { toast, confirm } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    batch: "",
    deadline: "",
    maxScore: 100,
    link: "",
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
        setAssignments(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await API.get("/batches");
      if (response.data.success) {
        setBatches(response.data.data || []);
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
        batch: newAssignment.batch === "all" || newAssignment.batch === "" ? null : newAssignment.batch,
        deadline: newAssignment.deadline,
        maxScore: newAssignment.maxScore,
        description: newAssignment.description || newAssignment.title,
        link: newAssignment.link,
      };

      const response = await API.post("/assignments", payload);
      if (response.data.success) {
        fetchAssignments();
        setIsModalOpen(false);
        toast.success("Assignment created successfully");
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
      toast.error(error.response?.data?.message || "Failed to add assignment");
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;
    try {
      const batchVal = editingAssignment.batch?._id || editingAssignment.batch;
      const payload = {
        title: editingAssignment.title,
        batch: batchVal === "all" || batchVal === "" ? null : batchVal,
        deadline: editingAssignment.deadline,
        maxScore: editingAssignment.maxScore,
        description: editingAssignment.description,
        link: editingAssignment.link,
      };

      const response = await API.put(`/assignments/${editingAssignment._id}`, payload);
      if (response.data.success) {
        const updated = response.data.data;
        setAssignments(assignments.map((a) => (a._id === updated._id ? updated : a)));
        setIsEditModalOpen(false);
        setEditingAssignment(null);
        toast.success("Assignment updated successfully");
      }
    } catch (error) {
      console.error("Failed to update assignment:", error);
      toast.error(error.response?.data?.message || "Failed to update assignment");
    }
  };

  const handleDeleteAssignment = async (id) => {
    const ok = await confirm({
      title: "Delete Assignment",
      message: "Are you sure you want to delete this assignment? All associated student submissions will be affected.",
      confirmText: "Yes, Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await API.delete(`/assignments/${id}`);
        setAssignments(assignments.filter((a) => a._id !== id));
        toast.success("Assignment deleted successfully");
      } catch (error) {
        console.error("Failed to delete assignment:", error);
        toast.error(error.response?.data?.message || "Failed to delete assignment");
      }
    }
  };

  const openGrading = (id) => {
    setActiveGradingId(id);
    setIsGradingModalOpen(true);
  };

  const completeGrading = () => {
    setIsGradingModalOpen(false);
    setActiveGradingId(null);
    toast.success("Grading updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Contests & Assignments
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} />
          <span>New Contest/Assignment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Batch:{" "}
                    {assignment.batch?.name ||
                      assignment.batch?.track ||
                      "All Tracks"}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    assignment.status === "Active"
                      ? "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300"
                      : assignment.status === "Grading"
                        ? "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300"
                        : "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300"
                  }`}
                >
                  {assignment.status || "Active"}
                </span>
              </div>

              {assignment.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {assignment.description}
                </p>
              )}

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4 space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock size={16} className="text-gray-400" />
                  <span>
                    Due: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : "No deadline"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText size={16} className="text-gray-400" />
                  <span>{assignment.maxScore || 100} Points</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  title="Edit Assignment"
                  onClick={() => {
                    setEditingAssignment({
                      ...assignment,
                      batch: assignment.batch?._id || assignment.batch || "",
                      deadline: assignment.deadline
                        ? new Date(assignment.deadline).toISOString().split("T")[0]
                        : "",
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit size={17} />
                </button>
                <button
                  type="button"
                  title="Delete Assignment"
                  onClick={() => handleDeleteAssignment(assignment._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <button
                onClick={() => openGrading(assignment._id)}
                className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
              >
                Grade Submissions
              </button>
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
                  <option value="all">All</option>
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

      {/* Edit Assignment Modal */}
      {isEditModalOpen && editingAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Edit Assignment
              </h2>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingAssignment(null); }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  required
                  type="text"
                  value={editingAssignment.title}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g. DSA Contest #3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingAssignment.description || ""}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Describe the assignment..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Track
                </label>
                <select
                  value={editingAssignment.batch?._id || editingAssignment.batch || ""}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, batch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Track...</option>
                  <option value="all">All</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name || b.track}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={editingAssignment.deadline || ""}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contest / Problem Link
                </label>
                <input
                  type="url"
                  value={editingAssignment.link || ""}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://codeforces.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Score / Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingAssignment.maxScore || 100}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, maxScore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingAssignment(null); }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Save Changes
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
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This will mark all submissions as graded and update the status to
              Completed.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsGradingModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={completeGrading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
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
