import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Trash2,
  X,
  Filter,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import API from "../../api/axios";

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Filtering
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState("All");

  React.useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await API.get("/users?role=mentor");
        if (response.data.success) {
          // Map backend fields to frontend expected fields
          const fetchedMentors = response.data.data.map((m) => ({
            id: m._id,
            name: m.name,
            gender: m.gender || "Male",
            email: m.email,
            phone: m.phone || "",
            role: m.mentorRole || "Mentor",
            expertise: m.expertise || [],
            status: m.isActive ? "Active" : "Inactive",
          }));
          setMentors(fetchedMentors);
        }
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      }
    };
    fetchMentors();
  }, []);

  const [newMentor, setNewMentor] = useState({
    name: "",
    gender: "Male",
    email: "",
    password: "",
    phone: "",
    role: "",
    expertise: "",
    status: "Active",
  });

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesSearch = mentor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesGender =
        genderFilter === "All" || mentor.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [mentors, searchTerm, genderFilter]);

  const handleAddMentor = async (e) => {
    e.preventDefault();
    try {
      const expertiseArray = newMentor.expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Post to backend
      const payload = {
        ...newMentor,
        role: "mentor",
        mentorRole: newMentor.role,
        expertise: expertiseArray,
      };
      
      const response = await API.post("/users", payload);

      // Update local state with returned user
      const m = response.data.data;
      const addedMentor = m
        ? {
            id: m._id,
            name: m.name,
            gender: m.gender || "Male",
            email: m.email,
            phone: m.phone || "",
            role: m.mentorRole || "Mentor",
            expertise: m.expertise || [],
            status: m.isActive ? "Active" : "Inactive",
          }
        : { ...newMentor, expertise: expertiseArray, id: Date.now() };

      setMentors([...mentors, addedMentor]);
      setIsModalOpen(false);
      setNewMentor({
        name: "",
        gender: "Male",
        email: "",
        password: "",
        phone: "",
        role: "",
        expertise: "",
        status: "Active",
      });
    } catch (error) {
      console.error("Failed to add mentor:", error);
      alert(error.response?.data?.message || "Failed to add mentor");
    }
  };

  const handleUpdateMentor = async (e) => {
    e.preventDefault();
    try {
      const expertiseArray = typeof editingMentor.expertise === "string" 
        ? editingMentor.expertise.split(",").map((s) => s.trim()).filter(Boolean)
        : editingMentor.expertise;

      const response = await API.put(`/users/${editingMentor.id}`, {
        name: editingMentor.name,
        gender: editingMentor.gender,
        email: editingMentor.email,
        phone: editingMentor.phone,
        mentorRole: editingMentor.role,
        expertise: expertiseArray,
        isActive: editingMentor.status === "Active",
      });

      const updated = response.data.data;
      setMentors(mentors.map(m => m.id === updated._id ? {
        id: updated._id,
        name: updated.name,
        gender: updated.gender || "Male",
        email: updated.email,
        phone: updated.phone || "",
        role: updated.mentorRole || "Mentor",
        expertise: updated.expertise || [],
        status: updated.isActive ? "Active" : "Inactive",
      } : m));

      setIsEditModalOpen(false);
      setEditingMentor(null);
    } catch (error) {
      console.error("Failed to update mentor:", error);
      alert(error.response?.data?.message || "Failed to update mentor");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this mentor?")) {
      try {
        await API.delete(`/users/${id}`);
        setMentors(mentors.filter((m) => m.id !== id));
      } catch (error) {
        console.error("Failed to delete mentor:", error);
      }
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
            placeholder="Search mentors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Advanced Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 p-4 z-10">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender Filter
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 text-sm"
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Mentor</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Track/Expertise
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMentors.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <p>No mentors found. Add a mentor to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredMentors.map((mentor) => (
                  <tr
                    key={mentor.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 flex-shrink-0 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold shadow-sm">
                        {mentor.name.charAt(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {mentor.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mentor.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span>{mentor.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">
                        {mentor.role}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Edit Mentor"
                          onClick={() => {
                            setEditingMentor({
                              ...mentor,
                              expertise: mentor.expertise.join(", ")
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-teal-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          title="Delete Mentor"
                          onClick={() => handleDelete(mentor.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Add New Mentor
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMentor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newMentor.name}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    placeholder="e.g. Abdullah Isa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    required
                    value={newMentor.gender}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={newMentor.email}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    placeholder="name@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={newMentor.password}
                      onChange={(e) =>
                        setNewMentor({ ...newMentor, password: e.target.value })
                      }
                      className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-teal-500"
                      placeholder="Set a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    required
                    type="tel"
                    value={newMentor.phone}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                    placeholder="+123..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <input
                  required
                  type="text"
                  value={newMentor.role}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="e.g. Web Dev Mentor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expertise (comma separated)
                </label>
                <input
                  required
                  type="text"
                  value={newMentor.expertise}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, expertise: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="React, Node, MongoDB"
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
                  Add Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mentor Modal */}
      {isEditModalOpen && editingMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Edit Mentor
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateMentor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={editingMentor.name}
                    onChange={(e) =>
                      setEditingMentor({ ...editingMentor, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    required
                    value={editingMentor.gender}
                    onChange={(e) =>
                      setEditingMentor({ ...editingMentor, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={editingMentor.email}
                    onChange={(e) =>
                      setEditingMentor({ ...editingMentor, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    required
                    type="tel"
                    value={editingMentor.phone}
                    onChange={(e) =>
                      setEditingMentor({ ...editingMentor, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <input
                  required
                  type="text"
                  value={editingMentor.role}
                  onChange={(e) =>
                    setEditingMentor({ ...editingMentor, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expertise (comma separated)
                </label>
                <input
                  required
                  type="text"
                  value={editingMentor.expertise}
                  onChange={(e) =>
                    setEditingMentor({ ...editingMentor, expertise: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsPage;
