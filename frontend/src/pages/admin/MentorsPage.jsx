import React, { useState, useMemo } from "react";
import { Search, Plus, Mail, Phone, Trash2, X, Filter } from "lucide-react";

const initialMentors = [
  {
    id: 1,
    name: "Yasmin Ali",
    gender: "Female",
    email: "jazmin@gmail.com",
    phone: "+1 234 567 8900",
    role: "Web Dev Mentor",
    expertise: ["React", "Node.js", "MongoDB"],
    status: "Active",
  },
  {
    id: 2,
    name: "Ahmed Sani",
    gender: "Male",
    email: "ahmed.sani@gmail.com",
    phone: "+1 234 567 8901",
    role: "CP Mentor",
    expertise: ["C++", "Algorithms", "Codeforces"],
    status: "Active",
  },
  {
    id: 3,
    name: "Sara Seid",
    gender: "Female",
    email: "sara.seid@gmail.com",
    phone: "+1 234 567 8902",
    role: "Backend Mentor",
    expertise: ["Python", "Django", "PostgreSQL"],
    status: "On Leave",
  },
];

const MentorsPage = () => {
  const [mentors, setMentors] = useState(initialMentors);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtering
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState("All");

  const [newMentor, setNewMentor] = useState({
    name: "",
    gender: "Male",
    email: "",
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

  const handleAddMentor = (e) => {
    e.preventDefault();
    const expertiseArray = newMentor.expertise
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setMentors([
      ...mentors,
      { ...newMentor, expertise: expertiseArray, id: Date.now() },
    ]);
    setIsModalOpen(false);
    setNewMentor({
      name: "",
      gender: "Male",
      email: "",
      phone: "",
      role: "",
      expertise: "",
      status: "Active",
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this mentor?")) {
      setMentors(mentors.filter((m) => m.id !== id));
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expertise
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
              {filteredMentors.map((mentor) => (
                <tr
                  key={mentor.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                        {mentor.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {mentor.name}{" "}
                          <span className="text-xs text-gray-400 ml-1">
                            ({mentor.gender})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {mentor.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center space-x-2">
                      <Mail size={14} className="text-gray-400" />
                      <span>{mentor.email}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2 mt-1">
                      <Phone size={14} className="text-gray-400" />
                      <span>{mentor.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mentor.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {mentor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(mentor.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMentors.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No mentors found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Add Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Mentor
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMentor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
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
    </div>
  );
};

export default MentorsPage;
