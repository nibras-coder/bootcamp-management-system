import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import {
  Plus,
  X,
  Paperclip,
  Search,
  Trash2,
  Eye,
} from "lucide-react";
import api from "../utils/api";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    batch: "",
    startDate: "",
    deadline: "",
    maxScore: 100,
    resourceLink: "",
  });

  const [file, setFile] = useState(null);

  // ==========================================
  // Load assignments
  // ==========================================
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/assignments");

      setAssignments(response.data.data || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Load mentor batches
  // ==========================================
  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response = await api.get("/batches/mentor");

      setBatches(response.data.data || []);
    } catch (err) {
      console.error("Failed to load batches:", err);

      // Don't stop the whole page if batches aren't available.
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  // ==========================================
  // Initial load
  // ==========================================
  useEffect(() => {
    fetchAssignments();
    fetchBatches();
  }, []);

  // ==========================================
  // Form change
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // File selection
  // ==========================================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // ==========================================
  // Create assignment
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.batch ||
      !formData.startDate ||
      !formData.deadline ||
      formData.maxScore === ""
    ) {
      alert(
        "Please fill in all required fields."
      );
      return;
    }

    if (
      new Date(formData.deadline) <
      new Date(formData.startDate)
    ) {
      alert(
        "Deadline cannot be before the start date."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructions:
          formData.instructions.trim(),
        batch: formData.batch,
        startDate: formData.startDate,
        deadline: formData.deadline,
        maxScore: Number(formData.maxScore),
        resourceLink:
          formData.resourceLink.trim(),
      };

      const response = await api.post(
        "/assignments",
        payload
      );

      const createdAssignment =
        response.data.data;

      setAssignments((previous) => [
        createdAssignment,
        ...previous,
      ]);

      resetForm();

      alert("Assignment created successfully!");
    } catch (err) {
      console.error(
        "Create assignment error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to create assignment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // Reset form
  // ==========================================
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      batch: "",
      startDate: "",
      deadline: "",
      maxScore: 100,
      resourceLink: "",
    });

    setFile(null);
    setShowForm(false);
  };

  // ==========================================
  // Delete assignment
  // ==========================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/assignments/${id}`);

      setAssignments((previous) =>
        previous.filter(
          (assignment) =>
            assignment._id !== id
        )
      );

      if (
        selectedAssignment?._id === id
      ) {
        setSelectedAssignment(null);
      }
    } catch (err) {
      console.error(
        "Delete assignment error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete assignment"
      );
    }
  };

  // ==========================================
  // Assignment status
  // ==========================================
  const getStatus = (assignment) => {
    const now = new Date();
    const startDate = new Date(
      assignment.startDate
    );
    const deadline = new Date(
      assignment.deadline
    );

    if (now < startDate) {
      return "Upcoming";
    }

    if (now > deadline) {
      return "Closed";
    }

    return "Active";
  };

  // ==========================================
  // Filter assignments
  // ==========================================
  const filteredAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) => {
        const title =
          assignment.title?.toLowerCase() ||
          "";

        const batchName =
          assignment.batch?.name?.toLowerCase() ||
          "";

        const searchValue =
          search.toLowerCase();

        const matchesSearch =
          title.includes(searchValue) ||
          batchName.includes(searchValue);

        const matchesBatch =
          batchFilter === "all" ||
          assignment.batch?._id ===
            batchFilter;

        const matchesStatus =
          statusFilter === "all" ||
          getStatus(assignment) ===
            statusFilter;

        return (
          matchesSearch &&
          matchesBatch &&
          matchesStatus
        );
      }
    );
  }, [
    assignments,
    search,
    batchFilter,
    statusFilter,
  ]);

  // ==========================================
  // Format date
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* ================================= */}
        {/* Header */}
        {/* ================================= */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assignments
            </h1>

            <p className="text-gray-500 text-sm">
              Create and manage assignments
              for your batches.
            </p>
          </div>

          <button
            onClick={() =>
              setShowForm(true)
            }
            className="flex items-center gap-2 bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-teal-900"
          >
            <Plus size={16} />
            New Assignment
          </button>
        </div>

        {/* ================================= */}
        {/* Filters */}
        {/* ================================= */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search assignments..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-teal-600"
              />
            </div>

            {/* Batch filter */}
            <select
              value={batchFilter}
              onChange={(e) =>
                setBatchFilter(e.target.value)
              }
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
            >
              <option value="all">
                All Batches
              </option>

              {batches.map((batch) => (
                <option
                  key={batch._id}
                  value={batch._id}
                >
                  {batch.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
            >
              <option value="all">
                All Status
              </option>
              <option value="Upcoming">
                Upcoming
              </option>
              <option value="Active">
                Active
              </option>
              <option value="Closed">
                Closed
              </option>
            </select>
          </div>
        </div>

        {/* ================================= */}
        {/* Error */}
        {/* ================================= */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4 mb-5 text-sm">
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* Assignment table */}
        {/* ================================= */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              Loading assignments...
            </div>
          ) : filteredAssignments.length ===
            0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                No assignments found.
              </p>

              {assignments.length ===
                0 && (
                <p className="text-gray-400 text-sm mt-1">
                  Create your first assignment
                  to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-normal">
                      Title
                    </th>

                    <th className="pb-3 font-normal">
                      Batch
                    </th>

                    <th className="pb-3 font-normal">
                      Start Date
                    </th>

                    <th className="pb-3 font-normal">
                      Deadline
                    </th>

                    <th className="pb-3 font-normal">
                      Max Score
                    </th>

                    <th className="pb-3 font-normal">
                      Status
                    </th>

                    <th className="pb-3 font-normal">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssignments.map(
                    (assignment) => {
                      const status =
                        getStatus(
                          assignment
                        );

                      return (
                        <tr
                          key={
                            assignment._id
                          }
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="py-4 font-medium text-gray-800">
                            {
                              assignment.title
                            }
                          </td>

                          <td className="py-4 text-gray-600">
                            {assignment.batch
                              ?.name ||
                              "—"}
                          </td>

                          <td className="py-4 text-gray-600">
                            {formatDate(
                              assignment.startDate
                            )}
                          </td>

                          <td className="py-4 text-gray-600">
                            {formatDate(
                              assignment.deadline
                            )}
                          </td>

                          <td className="py-4 text-gray-600">
                            {
                              assignment.maxScore
                            }
                          </td>

                          <td className="py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs ${
                                status ===
                                "Active"
                                  ? "bg-green-50 text-green-700"
                                  : status ===
                                    "Upcoming"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedAssignment(
                                    assignment
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                title="View"
                              >
                                <Eye
                                  size={16}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    assignment._id
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                                title="Delete"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* Create assignment modal */}
        {/* ================================= */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    New Assignment
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Create an assignment for
                    your batch.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X
                    size={18}
                    className="text-gray-400"
                  />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. React Todo App"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>

                  <textarea
                    name="description"
                    placeholder="Describe the assignment..."
                    rows={3}
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>

                  <textarea
                    name="instructions"
                    placeholder="What should students do?"
                    rows={3}
                    value={
                      formData.instructions
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch *
                  </label>

                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    disabled={
                      loadingBatches
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600 disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingBatches
                        ? "Loading batches..."
                        : "Select batch"}
                    </option>

                    {batches.map((batch) => (
                      <option
                        key={batch._id}
                        value={batch._id}
                      >
                        {batch.name}
                        {batch.track
                          ? ` - ${batch.track}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {!loadingBatches &&
                    batches.length ===
                      0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        No batches are currently
                        assigned to you.
                      </p>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={
                        formData.startDate
                      }
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline *
                    </label>

                    <input
                      type="date"
                      name="deadline"
                      min={
                        formData.startDate ||
                        undefined
                      }
                      value={
                        formData.deadline
                      }
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* Max score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Score *
                  </label>

                  <input
                    type="number"
                    name="maxScore"
                    min="0"
                    value={
                      formData.maxScore
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                {/* Resource link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Link
                  </label>

                  <input
                    type="url"
                    name="resourceLink"
                    placeholder="https://github.com/... or other resource"
                    value={
                      formData.resourceLink
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-teal-600"
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment
                  </label>

                  <div className="border border-dashed border-gray-300 rounded-lg p-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-teal-700">
                      <Paperclip
                        size={16}
                      />

                      <span>
                        Choose a file
                      </span>

                      <input
                        type="file"
                        onChange={
                          handleFileChange
                        }
                        className="hidden"
                      />
                    </label>

                    {file && (
                      <p className="text-xs text-teal-700 mt-2 flex items-center gap-1">
                        <Paperclip
                          size={12}
                        />
                        {file.name}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    File storage will be
                    connected separately.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    batches.length === 0
                  }
                  className="w-full bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Creating..."
                    : "Create Assignment"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* Assignment details modal */}
        {/* ================================= */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {
                      selectedAssignment.title
                    }
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAssignment.batch
                      ?.name || "No batch"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedAssignment(
                      null
                    )
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X
                    size={18}
                    className="text-gray-400"
                  />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">
                    Description
                  </p>
                  <p className="text-gray-700">
                    {
                      selectedAssignment.description
                    }
                  </p>
                </div>

                {selectedAssignment.instructions && (
                  <div>
                    <p className="text-gray-400 mb-1">
                      Instructions
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {
                        selectedAssignment.instructions
                      }
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">
                      Start Date
                    </p>
                    <p className="text-gray-700 mt-1">
                      {formatDate(
                        selectedAssignment.startDate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">
                      Deadline
                    </p>
                    <p className="text-gray-700 mt-1">
                      {formatDate(
                        selectedAssignment.deadline
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400">
                    Maximum Score
                  </p>

                  <p className="text-gray-700 mt-1">
                    {
                      selectedAssignment.maxScore
                    }
                  </p>
                </div>

                {selectedAssignment.resourceLink && (
                  <div>
                    <p className="text-gray-400 mb-1">
                      Resource
                    </p>

                    <a
                      href={
                        selectedAssignment.resourceLink
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:underline break-all"
                    >
                      {
                        selectedAssignment.resourceLink
                      }
                    </a>
                  </div>
                )}

                {selectedAssignment.attachment
                  ?.fileName && (
                  <div>
                    <p className="text-gray-400 mb-1">
                      Attachment
                    </p>

                    <div className="flex items-center gap-2 text-teal-700">
                      <Paperclip
                        size={15}
                      />
                      {
                        selectedAssignment
                          .attachment
                          .fileName
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Assignments;