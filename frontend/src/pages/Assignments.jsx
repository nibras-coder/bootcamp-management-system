import { useMemo, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import {
  Plus,
  X,
  Paperclip,
  Search,
  Filter,
  ExternalLink,
  Eye,
  Trash2,
  CalendarDays,
  Users,
  Award,
  Clock,
} from "lucide-react";

const initialAssignments = [
  {
    id: 1,
    title: "React Components",
    description: "Build 3 reusable components with props.",
    instructions:
      "Create three reusable React components and demonstrate how props are passed between them.",
    batch: "Batch 1",
    startDate: "2026-08-18",
    deadline: "2026-08-28",
    maxScore: 100,
    link: "https://react.dev/",
    fileName: "react-components.pdf",
    submissions: 18,
    totalStudents: 25,
  },
  {
    id: 2,
    title: "API Integration",
    description: "Connect a frontend form to a REST API.",
    instructions:
      "Build a frontend form and connect it to a REST API using Axios or Fetch.",
    batch: "Batch 2",
    startDate: "2026-08-20",
    deadline: "2026-09-02",
    maxScore: 100,
    link: "https://developer.mozilla.org/",
    fileName: null,
    submissions: 12,
    totalStudents: 22,
  },
  {
    id: 3,
    title: "JavaScript Fundamentals",
    description: "Practice JavaScript variables, functions and arrays.",
    instructions:
      "Complete all the JavaScript exercises and submit your solution.",
    batch: "Batch 1",
    startDate: "2026-08-10",
    deadline: "2026-08-19",
    maxScore: 50,
    link: "",
    fileName: "javascript-exercises.pdf",
    submissions: 25,
    totalStudents: 25,
  },
];

function getAssignmentStatus(startDate, deadline) {
  const now = new Date();
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${deadline}T23:59:59`);

  if (now < start) {
    return "Upcoming";
  }

  if (now > end) {
    return "Closed";
  }

  return "Active";
}

function getStatusStyle(status) {
  if (status === "Active") {
    return "bg-green-100 text-green-700";
  }

  if (status === "Upcoming") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-gray-100 text-gray-600";
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Assignments() {
  const [assignments, setAssignments] = useState(initialAssignments);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    batch: "",
    startDate: "",
    deadline: "",
    maxScore: 100,
    link: "",
  });

  const [file, setFile] = useState(null);

  const batches = ["Batch 1", "Batch 2", "Batch 3"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.batch ||
      !formData.startDate ||
      !formData.deadline
    ) {
      alert(
        "Please fill in the title, batch, start date and deadline."
      );
      return;
    }

    if (new Date(formData.deadline) < new Date(formData.startDate)) {
      alert("Deadline cannot be before the start date.");
      return;
    }

    const newAssignment = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      batch: formData.batch,
      startDate: formData.startDate,
      deadline: formData.deadline,
      maxScore: Number(formData.maxScore),
      link: formData.link,
      fileName: file ? file.name : null,
      submissions: 0,
      totalStudents: 25,
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    setFormData({
      title: "",
      description: "",
      instructions: "",
      batch: "",
      startDate: "",
      deadline: "",
      maxScore: 100,
      link: "",
    });

    setFile(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    setAssignments((prev) =>
      prev.filter((assignment) => assignment.id !== id)
    );
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const status = getAssignmentStatus(
        assignment.startDate,
        assignment.deadline
      );

      const matchesSearch = assignment.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const matchesBatch =
        batchFilter === "All" || assignment.batch === batchFilter;

      return matchesSearch && matchesStatus && matchesBatch;
    });
  }, [assignments, search, statusFilter, batchFilter]);

  const totalAssignments = assignments.length;

  const activeAssignments = assignments.filter(
    (assignment) =>
      getAssignmentStatus(
        assignment.startDate,
        assignment.deadline
      ) === "Active"
  ).length;

  const upcomingAssignments = assignments.filter(
    (assignment) =>
      getAssignmentStatus(
        assignment.startDate,
        assignment.deadline
      ) === "Upcoming"
  ).length;

  const closedAssignments = assignments.filter(
    (assignment) =>
      getAssignmentStatus(
        assignment.startDate,
        assignment.deadline
      ) === "Closed"
  ).length;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-7">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assignments
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Create, manage and review student assignments.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-teal-900 transition"
          >
            <Plus size={17} />
            New Assignment
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Assignments
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalAssignments}
                </p>
              </div>

              <div className="bg-teal-50 p-3 rounded-lg">
                <Award className="text-teal-700" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {activeAssignments}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <Clock className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {upcomingAssignments}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <CalendarDays className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Closed</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {closedAssignments}
                </p>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <Award className="text-gray-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search assignments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-teal-600"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Filter size={17} className="text-gray-400" />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
              >
                <option value="All">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Batch */}
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
            >
              <option value="All">All Batches</option>

              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignment table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-4 font-medium">
                    Assignment
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Batch
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Schedule
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Submissions
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Score
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((item) => {
                    const status = getAssignmentStatus(
                      item.startDate,
                      item.deadline
                    );

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition"
                      >
                        {/* Assignment */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.title}
                            </p>

                            <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                              {item.description || "No description"}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              {item.fileName && (
                                <span className="flex items-center gap-1 text-xs text-teal-700">
                                  <Paperclip size={12} />
                                  File
                                </span>
                              )}

                              {item.link && (
                                <span className="flex items-center gap-1 text-xs text-blue-600">
                                  <ExternalLink size={12} />
                                  Link
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Batch */}
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Users size={14} />
                            {item.batch}
                          </span>
                        </td>

                        {/* Schedule */}
                        <td className="px-5 py-4">
                          <div className="text-xs">
                            <p className="text-gray-500">
                              Start:{" "}
                              <span className="text-gray-700">
                                {formatDate(item.startDate)}
                              </span>
                            </p>

                            <p className="text-gray-500 mt-1">
                              Due:{" "}
                              <span className="text-gray-700">
                                {formatDate(item.deadline)}
                              </span>
                            </p>
                          </div>
                        </td>

                        {/* Submissions */}
                        <td className="px-5 py-4 text-gray-600">
                          {item.submissions}/{item.totalStudents}
                        </td>

                        {/* Score */}
                        <td className="px-5 py-4 text-gray-600">
                          {item.maxScore}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedAssignment(item);
                                setShowDetails(true);
                              }}
                              className="p-2 rounded-lg hover:bg-teal-50 text-gray-500 hover:text-teal-700"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                              title="Delete assignment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-12 text-gray-400"
                    >
                      No assignments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create assignment modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    New Assignment
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Create an assignment for your students.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. React Components"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>

                  <textarea
                    name="description"
                    placeholder="Describe the assignment..."
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600 resize-none"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Instructions
                  </label>

                  <textarea
                    name="instructions"
                    placeholder="Give students detailed instructions..."
                    rows={4}
                    value={formData.instructions}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600 resize-none"
                  />
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Batch *
                  </label>

                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  >
                    <option value="">Select batch</option>

                    {batches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Start Date *
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Deadline *
                    </label>

                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    name="maxScore"
                    min="1"
                    value={formData.maxScore}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Resource / Assignment Link
                  </label>

                  <input
                    type="url"
                    name="link"
                    placeholder="https://..."
                    value={formData.link}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />

                  <p className="text-xs text-gray-400 mt-1">
                    Add GitHub, documentation, Google Drive or another
                    resource link.
                  </p>
                </div>

                {/* File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Attachment
                  </label>

                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-teal-400 transition">
                    <Paperclip
                      size={22}
                      className="mx-auto text-gray-400 mb-2"
                    />

                    <input
                      id="assignment-file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <label
                      htmlFor="assignment-file"
                      className="cursor-pointer text-sm text-teal-700 font-medium"
                    >
                      Choose a file
                    </label>

                    <p className="text-xs text-gray-400 mt-1">
                      Upload instructions, PDFs, resources, etc.
                    </p>
                  </div>

                  {file && (
                    <div className="mt-2 flex items-center justify-between bg-teal-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-teal-700 flex items-center gap-2">
                        <Paperclip size={13} />
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900"
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assignment details modal */}
        {showDetails && selectedAssignment && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    Assignment Details
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {selectedAssignment.batch}
                  </p>
                </div>

                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedAssignment.title}
                  </h2>

                  <span
                    className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      getAssignmentStatus(
                        selectedAssignment.startDate,
                        selectedAssignment.deadline
                      )
                    )}`}
                  >
                    {getAssignmentStatus(
                      selectedAssignment.startDate,
                      selectedAssignment.deadline
                    )}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </h4>

                  <p className="text-sm text-gray-500">
                    {selectedAssignment.description ||
                      "No description provided."}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Instructions
                  </h4>

                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {selectedAssignment.instructions ||
                      "No instructions provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">
                      Start Date
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {formatDate(selectedAssignment.startDate)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">
                      Deadline
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {formatDate(selectedAssignment.deadline)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">
                      Maximum Score
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {selectedAssignment.maxScore}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">
                      Submissions
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {selectedAssignment.submissions}/
                      {selectedAssignment.totalStudents}
                    </p>
                  </div>
                </div>

                {selectedAssignment.link && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Resource Link
                    </h4>

                    <a
                      href={selectedAssignment.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-teal-700 hover:underline break-all"
                    >
                      <ExternalLink size={15} />
                      {selectedAssignment.link}
                    </a>
                  </div>
                )}

                {selectedAssignment.fileName && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Attachment
                    </h4>

                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
                      <Paperclip
                        size={16}
                        className="text-teal-700"
                      />

                      <span className="text-sm text-gray-600">
                        {selectedAssignment.fileName}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Assignments;