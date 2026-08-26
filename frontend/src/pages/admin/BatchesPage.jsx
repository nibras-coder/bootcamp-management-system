import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  X,
  User as UserIcon,
} from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const BatchesPage = () => {
  const { toast, confirm } = useToast();
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    status: "Upcoming",
    students: 0,
    startDate: "",
    endDate: "",
    instructor: "",
  });
  const [mentors, setMentors] = useState([]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);

  useEffect(() => {
    fetchBatches();
    fetchMentors();
  }, []);

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

  const fetchMentors = async () => {
    try {
      const response = await API.get("/users?role=mentor");
      if (response.data.success) {
        setMentors(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    }
  };

  const filteredBatches = batches.filter((batch) =>
    (batch.name || batch.track || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/batches", newBatch);
      if (response.data.success) {
        setBatches([...batches, response.data.data]);
        setIsModalOpen(false);
        toast.success("Track / Batch created successfully");
        setNewBatch({
          name: "",
          status: "Upcoming",
          students: 0,
          startDate: "",
          endDate: "",
          instructor: "",
        });
      }
    } catch (error) {
      console.error("Failed to add batch:", error);
      toast.error(error.response?.data?.message || "Failed to create batch");
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Track / Batch",
      message: "Are you sure you want to delete this track batch? This action cannot be undone.",
      confirmText: "Yes, Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await API.delete(`/batches/${id}`);
        setBatches(batches.filter((b) => b._id !== id));
        toast.success("Track batch deleted successfully");
      } catch (error) {
        console.error("Failed to delete batch:", error);
        toast.error(error.response?.data?.message || "Failed to delete batch");
      }
    }
  };

  const openBatchDetail = async (batch) => {
    setSelectedBatchForDetail(batch);
    setIsDetailModalOpen(true);
    setBatchStudents([]); // clear prev
    try {
      const response = await API.get(`/batches/${batch._id}/students`);
      if (response.data.success) {
        setBatchStudents(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch students for batch:", error);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Track</span>
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div
            key={batch._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow relative group"
          >
            {/* Delete button (shows on hover) */}
            <button
              onClick={() => handleDelete(batch._id)}
              className="absolute top-4 right-4 p-1 bg-white dark:bg-gray-800 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50 z-10"
              title="Delete batch"
            >
              <X size={16} />
            </button>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4 pr-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {batch.name || batch.track}
                  </h3>
                  <span
                    className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                      batch.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : batch.status === "Upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {batch.status || "Upcoming"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{batch.students?.length || 0} Students</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {new Date(batch.startDate).toLocaleDateString()} -{" "}
                    {new Date(batch.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    Instructor:{" "}
                    {typeof batch.instructor === "object"
                      ? batch.instructor?.name || "Unknown"
                      : batch.instructor || "Not Assigned"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => openBatchDetail(batch)}
                className="text-teal-600 text-sm font-medium hover:text-teal-700"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        {filteredBatches.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500">
            No batches found.
          </div>
        )}
      </div>

      {/* Add Track Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Add New Batch</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Track Name
                </label>
                <input
                  required
                  type="text"
                  value={newBatch.name}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="e.g. Web Dev Bootcamp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newBatch.endDate}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instructor
                </label>
                <input
                  list="mentors-list"
                  value={newBatch.instructor}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, instructor: e.target.value })
                  }
                  placeholder="type instructor name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
                <datalist id="mentors-list">
                  {mentors.map((m) => (
                    <option key={m._id} value={m.name}></option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={newBatch.status}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
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
                  Create Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBatchForDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {selectedBatchForDetail.name || selectedBatchForDetail.track}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enrolled Students ({batchStudents.length})
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {batchStudents.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No students are enrolled in this track yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {batchStudents.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-teal-100 text-teal-700 font-bold flex items-center justify-center rounded-full">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium bg-gray-200 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {student.gender || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesPage;
