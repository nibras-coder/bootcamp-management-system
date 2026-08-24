import React, { useState, useMemo } from "react";
import { Search, Plus, Filter, Download, Trash2, X, AlertTriangle } from "lucide-react";
import API from "../../api/axios";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState(""); 
  const [batchFilter, setBatchFilter] = useState("");

  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningStudent, setWarningStudent] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");

  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "Male",
    email: "",
    batch: "",
    score: 0,
    status: "Good",
  });

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await API.get("/users/students");
        if (response.data.success) {
          setStudents(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = student.name || "";
      const matchesSearch = name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesGender = genderFilter ? student.gender === genderFilter : true;
      
      const batchName = student.batch?.name || student.batch?.track || "";
      const matchesBatch = batchFilter ? batchName === batchFilter : true;
      
      return matchesSearch && matchesGender && matchesBatch;
    });
  }, [students, searchTerm, genderFilter, batchFilter]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      // API request to add student
      const response = await API.post("/users", {
        ...newStudent,
        role: "student"
      });
      if (response.data.success) {
        setStudents([...students, response.data.data]);
        setIsModalOpen(false);
        setNewStudent({
          name: "",
          gender: "Male",
          email: "",
          batch: "",
          score: 0,
          status: "Good",
        });
      }
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      try {
        await API.delete(`/users/${id}`);
        setStudents(students.filter((s) => s._id !== id));
      } catch (error) {
        console.error("Failed to delete student:", error);
      }
    }
  };

  const handleWarn = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/users/students/${warningStudent._id}/warn`, { message: warningMessage });
      alert("Warning sent to " + warningStudent.name);
      setIsWarningModalOpen(false);
      setWarningStudent(null);
      setWarningMessage("");
    } catch (error) {
      console.error("Failed to send warning:", error);
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
                  <option value="">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Batch Filter
                </label>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 text-sm"
                >
                  <option value="">All</option>
                  <option value="Web Dev Bootcamp">Web Dev Bootcamp</option>
                  <option value="DSA & Competitive Programming">DSA & CP</option>
                  <option value="Backend Masterclass">Backend Masterclass</option>
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
                  Trach
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
                  key={student._id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {student.name ? student.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name || "Unknown Student"}{" "}
                          <span className="text-xs text-gray-400 ml-1">
                            ({student.gender || "N/A"})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.batch?.name || student.batch?.track || "Unassigned"}</div>
                    <div className="text-xs text-gray-500">
                      Joined {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[4rem]">
                        <div
                          className={`h-2.5 rounded-full ${student.score >= 90 ? "bg-green-500" : student.score >= 75 ? "bg-blue-500" : "bg-yellow-500"}`}
                          style={{ width: `${student.score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">
                        {student.score || 0}%
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
                      {student.status || "Good"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Warn Student"
                        onClick={() => {
                          setWarningStudent(student);
                          setIsWarningModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-yellow-600 transition-colors"
                      >
                        <AlertTriangle size={18} />
                      </button>
                      <button
                        title="Delete Student"
                        onClick={() => handleDelete(student._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
                    Track
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

      {/* Warning Modal */}
      {isWarningModalOpen && warningStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Warn Student
              </h2>
              <button
                onClick={() => setIsWarningModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleWarn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message for {warningStudent.name}
                </label>
                <textarea
                  required
                  rows="4"
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="Type warning message here..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsWarningModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Send Warning
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
