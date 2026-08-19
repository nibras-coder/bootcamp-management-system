import React, { useState, useMemo } from "react";
import { Search, Plus, Filter, Download, Trash2, X } from "lucide-react";

const initialStudents = [
  {
    id: 101,
    name: "Eman Abdu",
    gender: "Female",
    email: "eman@gmail.com",
    batch: "Web Dev Bootcamp",
    score: 92,
    status: "Excellent",
    joinDate: "2026-05-10",
  },
  {
    id: 102,
    name: "Liam Neeson",
    gender: "Male",
    email: "liam@gmail.com",
    batch: "Web Dev Bootcamp",
    score: 78,
    status: "Good",
    joinDate: "2026-05-11",
  },
  {
    id: 103,
    name: "Aya Fuad",
    gender: "Female",
    email: "aya@gmail.com",
    batch: "DSA & Competitive Programming",
    score: 88,
    status: "Very Good",
    joinDate: "2026-09-01",
  },
  {
    id: 104,
    name: "Noah Ali",
    gender: "Male",
    email: "noah@gmail.com",
    batch: "Backend Masterclass",
    score: 65,
    status: "Needs Improvement",
    joinDate: "2025-10-15",
  },
];

const StudentsPage = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState("All"); // 'All', 'Male', 'Female'

  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "Male",
    email: "",
    batch: "",
    score: 0,
    status: "Good",
  });

  // useMemo for active filtering
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesGender =
        genderFilter === "All" || student.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [students, searchTerm, genderFilter]);

  const handleAddStudent = (e) => {
    e.preventDefault();
    const date = new Date().toISOString().split("T")[0];
    setStudents([
      ...students,
      { ...newStudent, id: Date.now(), joinDate: date },
    ]);
    setIsModalOpen(false);
    setNewStudent({
      name: "",
      gender: "Male",
      email: "",
      batch: "",
      score: 0,
      status: "Good",
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          {/* Advanced Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-10">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Filter
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 text-sm"
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            )}
          </div>

          <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}{" "}
                          <span className="text-xs text-gray-400 ml-1">
                            ({student.gender})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.batch}</div>
                    <div className="text-xs text-gray-500">
                      Joined {student.joinDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[4rem]">
                        <div
                          className={`h-2.5 rounded-full ${student.score >= 90 ? "bg-green-500" : student.score >= 75 ? "bg-blue-500" : "bg-yellow-500"}`}
                          style={{ width: `${student.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">
                        {student.score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : student.status === "Very Good"
                            ? "bg-blue-100 text-blue-800"
                            : student.status === "Good"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No students found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Student
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    required
                    value={newStudent.batch}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, batch: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  >
                    <option value="">Select...</option>
                    <option value="Web Dev Bootcamp">Web Dev Bootcamp</option>
                    <option value="DSA & Competitive Programming">
                      DSA & CP
                    </option>
                    <option value="Backend Masterclass">
                      Backend Masterclass
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    required
                    value={newStudent.gender}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
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
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
