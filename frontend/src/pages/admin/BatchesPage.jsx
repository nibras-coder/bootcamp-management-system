import React, { useState } from "react";
import { Search, Plus, MoreVertical, Calendar, Users, X } from "lucide-react";

const initialBatches = [
  {
    id: 1,
    name: "Web Dev Bootcamp 2026",
    status: "Active",
    students: 45,
    startDate: "2026-05-10",
    endDate: "2026-11-10",
    instructor: "ALi kemal",
  },
  {
    id: 2,
    name: "DSA & Competitive Programming",
    status: "Upcoming",
    students: 30,
    startDate: "2026-09-01",
    endDate: "2027-03-01",
    instructor: "Nedil Jemal",
  },
  {
    id: 3,
    name: "Backend Masterclass (Node/Express)",
    status: "Completed",
    students: 25,
    startDate: "2025-10-15",
    endDate: "2026-02-15",
    instructor: "Reof Yassin ",
  },
];

const BatchesPage = () => {
  const [batches, setBatches] = useState(initialBatches);
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

  const filteredBatches = batches.filter((batch) =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddBatch = (e) => {
    e.preventDefault();
    setBatches([...batches, { ...newBatch, id: Date.now() }]);
    setIsModalOpen(false);
    setNewBatch({
      name: "",
      status: "Upcoming",
      students: 0,
      startDate: "",
      endDate: "",
      instructor: "",
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      setBatches(batches.filter((b) => b.id !== id));
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
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
          <span>New Trach</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group"
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    batch.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : batch.status === "Upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {batch.status}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">
                  {batch.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Instructor: {batch.instructor}
                </p>
              </div>
              <button
                onClick={() => handleDelete(batch.id)}
                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-gray-400" />
                <span>{batch.students} Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{batch.startDate}</span>
              </div>
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Batch</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <input
                  required
                  type="text"
                  value={newBatch.instructor}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, instructor: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="e.g. Abdullah Isa"
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
                  Add Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesPage;
