import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Trash2, X, AlertTriangle, UserCheck, BookOpen, Users, Loader2, UserCircle2 } from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const StudentsPage = () => {
  const { toast, confirm } = useToast();
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [savingAssign, setSavingAssign] = useState(false);

  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningStudent, setWarningStudent] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, mentorsRes, batchesRes] = await Promise.all([
        API.get("/users/students"),
        API.get("/users?role=mentor"),
        API.get("/batches"),
      ]);
      if (studentsRes.data.success) setStudents(studentsRes.data.data || []);
      if (mentorsRes.data.success) setMentors(mentorsRes.data.data || []);
      if (batchesRes.data.success) setBatches(batchesRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = student.name || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGender = genderFilter ? student.gender === genderFilter : true;
      const matchesBatch = batchFilter ? student.batch?._id === batchFilter : true;

      return matchesSearch && matchesGender && matchesBatch;
    });
  }, [students, searchTerm, genderFilter, batchFilter]);

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Remove Student",
      message: "Are you sure you want to remove this student? This action cannot be undone.",
      confirmText: "Yes, Remove",
      type: "danger",
    });
    if (ok) {
      try {
        await API.delete(`/users/${id}`);
        setStudents(students.filter((s) => s._id !== id));
        toast.success("Student removed successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove student");
      }
    }
  };

  const handleOpenAssign = (student) => {
    setAssigningStudent(student);
    setSelectedMentorId(student.mentor?._id || student.mentor || "");
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!assigningStudent) return;
    setSavingAssign(true);
    try {
      const res = await API.post(`/users/students/${assigningStudent._id}/assign-mentor`, {
        mentorId: selectedMentorId || null,
      });
      if (res.data.success) {
        toast.success(
          selectedMentorId
            ? `${assigningStudent.name} has been assigned to the selected mentor!`
            : `${assigningStudent.name} has been unassigned from their mentor.`
        );
        setIsAssignModalOpen(false);
        setAssigningStudent(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign student to mentor");
    } finally {
      setSavingAssign(false);
    }
  };

  const handleWarn = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/users/students/${warningStudent._id}/warn`, { message: warningMessage });
      toast.success(`Warning successfully sent to ${warningStudent.name}`);
      setIsWarningModalOpen(false);
      setWarningStudent(null);
      setWarningMessage("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send warning");
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 z-10 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Track / Batch
                  </label>
                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Tracks</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name || b.track}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={28} />
            <p className="text-sm">Loading students roster...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Assigned Mentor
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => {
                  const assignedMentor = student.mentor;
                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-full flex items-center justify-center font-bold text-sm">
                            {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {student.name || "Unknown Student"}
                              <span className="text-xs text-gray-400 ml-1.5 font-normal">
                                ({student.gender || "N/A"})
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                          <BookOpen size={11} />
                          {student.batch?.name || student.batch?.track || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignedMentor ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold text-xs">
                              {(assignedMentor.name || "M").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {assignedMentor.name}
                              </p>
                              <p className="text-xs text-gray-400">{assignedMentor.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-orange-500 font-medium">
                            No mentor assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            title="Assign to Mentor"
                            onClick={() => handleOpenAssign(student)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <UserCheck size={14} />
                            <span>Assign Mentor</span>
                          </button>
                          <button
                            title="Warn Student"
                            onClick={() => {
                              setWarningStudent(student);
                              setIsWarningModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <AlertTriangle size={16} />
                          </button>
                          <button
                            title="Delete Student"
                            onClick={() => handleDelete(student._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No students found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Assign to Mentor Modal ─── */}
      {isAssignModalOpen && assigningStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="text-teal-600" size={20} />
                Assign Mentor to Student
              </h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-sm">
              {/* Student Info */}
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                <div className="w-11 h-11 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  {(assigningStudent.name || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{assigningStudent.name}</p>
                  <p className="text-xs text-gray-400">{assigningStudent.email}</p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    {assigningStudent.batch?.name || assigningStudent.batch?.track || "No track assigned"}
                  </span>
                </div>
              </div>

              {/* Current Mentor */}
              {assigningStudent.mentor && (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  Currently assigned to:{" "}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {assigningStudent.mentor?.name || "a mentor"}
                  </strong>
                </div>
              )}

              {/* Mentor Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Mentor
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {/* Unassign option */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedMentorId === ""
                        ? "border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-700"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mentor"
                      value=""
                      checked={selectedMentorId === ""}
                      onChange={() => setSelectedMentorId("")}
                      className="accent-teal-600"
                    />
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <UserCircle2 size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No Mentor (Unassign)</p>
                      <p className="text-xs text-gray-400">Remove current mentor assignment</p>
                    </div>
                  </label>

                  {mentors.map((mentor) => (
                    <label
                      key={mentor._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedMentorId === mentor._id
                          ? "border-teal-500 dark:border-teal-600 bg-teal-50 dark:bg-teal-950/60"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mentor"
                        value={mentor._id}
                        checked={selectedMentorId === mentor._id}
                        onChange={() => setSelectedMentorId(mentor._id)}
                        className="accent-teal-600"
                      />
                      <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold text-sm">
                        {(mentor.name || "M").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{mentor.name}</p>
                        <p className="text-xs text-gray-400">{mentor.email}</p>
                        {mentor.mentorRole && (
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                            {mentor.mentorRole}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}

                  {mentors.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No mentors found. Create mentor accounts first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssign}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50 transition-colors"
                >
                  {savingAssign && <Loader2 size={15} className="animate-spin" />}
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Warning Modal ─── */}
      {isWarningModalOpen && warningStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={20} />
                Send Student Warning
              </h2>
              <button
                onClick={() => setIsWarningModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleWarn} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Warning message for {warningStudent.name}
                </label>
                <textarea
                  required
                  rows="4"
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  placeholder="e.g. Please submit your overdue assignments and attend mentor sessions..."
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWarningModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors"
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
