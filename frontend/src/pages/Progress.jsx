import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";
import {
  Search,
  Users,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Circle,
  Eye,
  X,
  ChevronDown,
} from "lucide-react";

const topics = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Git/GitHub",
];

const statusOptions = [
  "Not Started",
  "In Progress",
  "Completed",
  "Needs Improvement",
];

const statusColors = {
  "Not Started": "bg-gray-100 text-gray-600",
  "In Progress": "bg-orange-50 text-orange-600",
  Completed: "bg-teal-50 text-teal-700",
  "Needs Improvement": "bg-red-50 text-red-600",
};

const statusDotColors = {
  "Not Started": "bg-gray-400",
  "In Progress": "bg-orange-500",
  Completed: "bg-teal-600",
  "Needs Improvement": "bg-red-500",
};

function Progress() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const [note, setNote] = useState("");

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = async () => {
    try {
      const res = await api.get("/mentor/students");

      const studentData = res.data?.data || [];

      setStudents(studentData);

      if (
        studentData.length > 0 &&
        !selectedStudentId
      ) {
        setSelectedStudentId(studentData[0]._id);
      }
    } catch (error) {
      console.error("Failed to load students:", error);

      setToast({
        type: "error",
        message: "Failed to load students",
      });
    }
  };

  // =====================================================
  // FETCH PROGRESS
  // =====================================================

  const fetchProgress = async () => {
    try {
      const res = await api.get("/progress");

      const progressData = res.data?.data || [];

      setRecords(progressData);
    } catch (error) {
      console.error("Failed to load progress:", error);

      setToast({
        type: "error",
        message: "Failed to load progress",
      });
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchStudents(),
        fetchProgress(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =====================================================
  // BATCHES
  // =====================================================

  const batches = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      if (student.batch?._id) {
        map.set(student.batch._id, student.batch);
      }
    });

    return Array.from(map.values());
  }, [students]);

  // =====================================================
  // WEEKS
  // =====================================================

  const weeks = useMemo(() => {
    const uniqueWeeks = [
      ...new Set(
        records
          .map((record) => record.week)
          .filter(
            (week) =>
              week !== undefined &&
              week !== null
          )
      ),
    ];

    return uniqueWeeks.sort((a, b) => a - b);
  }, [records]);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return students.filter((student) => {
      const name =
        student.name?.toLowerCase() || "";

      const email =
        student.email?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        email.includes(searchValue);

      const matchesBatch =
        batchFilter === "all" ||
        student.batch?._id === batchFilter;

      // Records belonging to this student
      const studentRecords = records.filter(
        (record) =>
          record.student?._id === student._id
      );

      const matchesTopic =
        topicFilter === "all" ||
        studentRecords.some(
          (record) =>
            record.topic === topicFilter
        );

      const matchesStatus =
        statusFilter === "all" ||
        studentRecords.some(
          (record) =>
            record.status === statusFilter
        );

      const matchesWeek =
        weekFilter === "all" ||
        studentRecords.some(
          (record) =>
            String(record.week) ===
            String(weekFilter)
        );

      return (
        matchesSearch &&
        matchesBatch &&
        matchesTopic &&
        matchesStatus &&
        matchesWeek
      );
    });
  }, [
    students,
    records,
    search,
    batchFilter,
    topicFilter,
    statusFilter,
    weekFilter,
  ]);

  // =====================================================
  // STUDENT RECORD HELPER
  // =====================================================

  const getStudentRecords = (studentId) => {
    return records.filter(
      (record) =>
        record.student?._id === studentId
    );
  };

  // =====================================================
  // STUDENT PROGRESS
  // =====================================================

  const getStudentProgress = (studentId) => {
    const studentRecords =
      getStudentRecords(studentId);

    const completed = studentRecords.filter(
      (record) =>
        record.status === "Completed"
    ).length;

    const inProgress = studentRecords.filter(
      (record) =>
        record.status === "In Progress"
    ).length;

    const needsImprovement =
      studentRecords.filter(
        (record) =>
          record.status ===
          "Needs Improvement"
      ).length;

    const notStarted =
      studentRecords.filter(
        (record) =>
          record.status === "Not Started"
      ).length;

    const percentage = Math.min(
      Math.round(
        (completed / topics.length) * 100
      ),
      100
    );

    let status = "Not Started";

    if (needsImprovement > 0) {
      status = "Needs Improvement";
    } else if (
      percentage === 100
    ) {
      status = "Completed";
    } else if (
      inProgress > 0 ||
      completed > 0
    ) {
      status = "In Progress";
    }

    return {
      completed,
      inProgress,
      needsImprovement,
      notStarted,
      percentage,
      status,
    };
  };

  // =====================================================
  // GLOBAL STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let needsImprovement = 0;
    let notStarted = 0;

    filteredStudents.forEach((student) => {
      const progress =
        getStudentProgress(student._id);

      completed += progress.completed;
      inProgress += progress.inProgress;
      needsImprovement +=
        progress.needsImprovement;
      notStarted += progress.notStarted;
    });

    return {
      students: filteredStudents.length,
      completed,
      inProgress,
      needsImprovement,
      notStarted,
    };
  }, [filteredStudents, records]);

  // =====================================================
  // SELECTED STUDENT
  // =====================================================

  const selectedStudent = students.find(
    (student) =>
      student._id === selectedStudentId
  );

  // =====================================================
  // SELECTED STUDENT RECORDS
  // =====================================================

  const selectedStudentRecords = useMemo(() => {
    if (!selectedStudentId) return [];

    return records.filter(
      (record) =>
        record.student?._id ===
        selectedStudentId
    );
  }, [records, selectedStudentId]);

  // =====================================================
  // SELECTED STUDENT SUMMARY
  // =====================================================

  const progressSummary = useMemo(() => {
    const completed =
      selectedStudentRecords.filter(
        (record) =>
          record.status === "Completed"
      ).length;

    const inProgress =
      selectedStudentRecords.filter(
        (record) =>
          record.status === "In Progress"
      ).length;

    const needsImprovement =
      selectedStudentRecords.filter(
        (record) =>
          record.status ===
          "Needs Improvement"
      ).length;

    const notStarted =
      selectedStudentRecords.filter(
        (record) =>
          record.status === "Not Started"
      ).length;

    const completionPercentage = Math.min(
      Math.round(
        (completed / topics.length) * 100
      ),
      100
    );

    return {
      completed,
      inProgress,
      needsImprovement,
      notStarted,
      completionPercentage,
    };
  }, [selectedStudentRecords]);

  // =====================================================
  // TOPIC RECORD
  // =====================================================

  const getTopicRecord = (topic) => {
    const topicRecords =
      selectedStudentRecords.filter(
        (record) =>
          record.topic === topic
      );

    if (topicRecords.length === 0) {
      return null;
    }

    return [...topicRecords].sort(
      (a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt)
    )[0];
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusChange = async (
    topic,
    newStatus
  ) => {
    if (!selectedStudent) return;

    const existingRecord =
      getTopicRecord(topic);

    try {
      setSaving(true);

      if (existingRecord) {
        await api.put(
          `/progress/${existingRecord._id}`,
          {
            status: newStatus,
          }
        );
      } else {
        await api.post("/progress", {
          student: selectedStudent._id,
          batch:
            selectedStudent.batch?._id,
          topic,
          status: newStatus,
          week: 1,
        });
      }

      await fetchProgress();

      setToast({
        type: "success",
        message: `${topic} progress updated`,
      });
    } catch (error) {
      console.error(
        "Failed to update progress:",
        error
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update progress",
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SAVE NOTE
  // =====================================================

  const handleSaveNote = async () => {
    if (
      !selectedStudent ||
      !note.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      const existingRecord =
        getTopicRecord(topics[0]);

      if (existingRecord) {
        await api.put(
          `/progress/${existingRecord._id}`,
          {
            notes: note,
          }
        );
      } else {
        await api.post("/progress", {
          student: selectedStudent._id,
          batch:
            selectedStudent.batch?._id,
          topic: topics[0],
          status: "Not Started",
          week: 1,
          notes: note,
        });
      }

      await fetchProgress();

      setNote("");

      setToast({
        type: "success",
        message: "Note saved successfully",
      });
    } catch (error) {
      console.error(
        "Failed to save note:",
        error
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to save note",
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setBatchFilter("all");
    setTopicFilter("all");
    setStatusFilter("all");
    setWeekFilter("all");
  };

  const hasFilters =
    search ||
    batchFilter !== "all" ||
    topicFilter !== "all" ||
    statusFilter !== "all" ||
    weekFilter !== "all";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F4F7F8]">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-3xl" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-gray-200 rounded-2xl" />
              <div className="h-28 bg-gray-200 rounded-2xl" />
              <div className="h-28 bg-gray-200 rounded-2xl" />
              <div className="h-28 bg-gray-200 rounded-2xl" />
            </div>

            <div className="h-96 bg-gray-200 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex min-h-screen bg-[#F4F7F8]">
      <Sidebar />

      <main className="flex-1 min-w-0 p-5 md:p-8 overflow-y-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />

              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                Student Management
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Progress Management
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Monitor learning progress and provide
              feedback to your students.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
              <Users
                size={20}
                className="text-teal-700"
              />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Students shown
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {statistics.students}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <CheckCircle2
                  size={19}
                  className="text-teal-700"
                />
              </div>

              <span className="text-xs text-gray-400">
                Completed
              </span>
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-4">
              {statistics.completed}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Completed modules
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Clock3
                  size={19}
                  className="text-orange-600"
                />
              </div>

              <span className="text-xs text-gray-400">
                In Progress
              </span>
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-4">
              {statistics.inProgress}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Currently learning
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle
                  size={19}
                  className="text-red-500"
                />
              </div>

              <span className="text-xs text-gray-400">
                Attention
              </span>
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-4">
              {statistics.needsImprovement}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Need improvement
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Circle
                  size={19}
                  className="text-gray-500"
                />
              </div>

              <span className="text-xs text-gray-400">
                Not Started
              </span>
            </div>

            <p className="text-2xl font-bold text-gray-900 mt-4">
              {statistics.notStarted}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Modules remaining
            </p>
          </div>
        </div>

        {/* =================================================
            FILTER PANEL
        ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

            <div>
              <h2 className="font-bold text-gray-900">
                Student Progress
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Search, filter and review student performance.
              </p>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="self-start xl:self-auto flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-600 transition"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">

            {/* SEARCH */}

            <div className="relative lg:col-span-2">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-600 transition"
              />
            </div>

            {/* BATCH */}

            <div className="relative">
              <select
                value={batchFilter}
                onChange={(e) =>
                  setBatchFilter(e.target.value)
                }
                className="appearance-none w-full border border-gray-200 rounded-xl px-3 pr-9 py-2.5 text-sm bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100"
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

              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>

            {/* TOPIC */}

            <div className="relative">
              <select
                value={topicFilter}
                onChange={(e) =>
                  setTopicFilter(e.target.value)
                }
                className="appearance-none w-full border border-gray-200 rounded-xl px-3 pr-9 py-2.5 text-sm bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100"
              >
                <option value="all">
                  All Topics
                </option>

                {topics.map((topic) => (
                  <option
                    key={topic}
                    value={topic}
                  >
                    {topic}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="appearance-none w-full border border-gray-200 rounded-xl px-3 pr-9 py-2.5 text-sm bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100"
              >
                <option value="all">
                  All Statuses
                </option>

                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          </div>

          {weeks.length > 0 && (
            <div className="mt-3 w-full md:w-48 relative">
              <select
                value={weekFilter}
                onChange={(e) =>
                  setWeekFilter(e.target.value)
                }
                className="appearance-none w-full border border-gray-200 rounded-xl px-3 pr-9 py-2.5 text-sm bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100"
              >
                <option value="all">
                  All Weeks
                </option>

                {weeks.map((week) => (
                  <option
                    key={week}
                    value={week}
                  >
                    Week {week}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          )}
        </div>

        {/* =================================================
            STUDENT TABLE
        ================================================= */}

        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-gray-100">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center">
              <Users
                size={28}
                className="text-gray-400"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mt-5">
              No students found
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Try changing your search or filters.
            </p>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-7">

            {/* TABLE HEADER */}

            <div className="hidden lg:grid grid-cols-[2fr_1fr_1.7fr_1.2fr_1.2fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <span>Student</span>
              <span>Batch</span>
              <span>Progress</span>
              <span>Status</span>
              <span>Modules</span>
              <span>Action</span>
            </div>

            {/* STUDENT ROWS */}

            <div className="divide-y divide-gray-100">

              {filteredStudents.map(
                (student) => {
                  const progress =
                    getStudentProgress(
                      student._id
                    );

                  const selected =
                    selectedStudentId ===
                    student._id;

                  return (
                    <div
                      key={student._id}
                      className={`group transition-all ${
                        selected
                          ? "bg-teal-50/50"
                          : "hover:bg-gray-50"
                      }`}
                    >

                      {/* DESKTOP ROW */}

                      <div className="hidden lg:grid grid-cols-[2fr_1fr_1.7fr_1.2fr_1.2fr_auto] gap-4 items-center px-5 py-4">

                        {/* STUDENT */}

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="relative flex-shrink-0">

                            {student.avatarUrl ? (
                              <img
                                src={student.avatarUrl}
                                alt={student.name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                                {student.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>
                            )}

                            {student.isActive !== false && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {student.name}
                            </p>

                            <p className="text-xs text-gray-400 truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        {/* BATCH */}

                        <div>
                          {student.batch?.name ? (
                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                              {student.batch.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No batch
                            </span>
                          )}
                        </div>

                        {/* PROGRESS */}

                        <div className="min-w-0">

                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-gray-500">
                              {progress.completed}/
                              {topics.length} completed
                            </span>

                            <span className="text-xs font-bold text-gray-800">
                              {progress.percentage}%
                            </span>
                          </div>

                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                            <div
                              className={`h-full rounded-full transition-all ${
                                progress.percentage >=
                                80
                                  ? "bg-teal-600"
                                  : progress.percentage >=
                                    50
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${progress.percentage}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* STATUS */}

                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium ${
                              statusColors[
                                progress.status
                              ]
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                statusDotColors[
                                  progress.status
                                ]
                              }`}
                            />

                            {progress.status}
                          </span>
                        </div>

                        {/* MODULES */}

                        <div className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-800">
                            {progress.completed}
                          </span>{" "}
                          completed
                        </div>

                        {/* ACTION */}

                        <button
                          onClick={() =>
                            setSelectedStudentId(
                              student._id
                            )
                          }
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                            selected
                              ? "bg-teal-700 text-white"
                              : "text-teal-700 bg-teal-50 hover:bg-teal-100"
                          }`}
                        >
                          <Eye size={14} />
                          {selected
                            ? "Viewing"
                            : "View"}
                        </button>
                      </div>

                      {/* MOBILE / TABLET ROW */}

                      <div className="lg:hidden p-5">

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-center gap-3 min-w-0">

                            {student.avatarUrl ? (
                              <img
                                src={student.avatarUrl}
                                alt={student.name}
                                className="w-11 h-11 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-11 h-11 flex-shrink-0 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                                {student.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {student.name}
                              </p>

                              <p className="text-xs text-gray-400 truncate">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          <span className="text-sm font-bold text-teal-700">
                            {progress.percentage}%
                          </span>
                        </div>

                        <div className="mt-4">

                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-400">
                              Overall progress
                            </span>

                            <span className="text-gray-500">
                              {progress.completed}/
                              {topics.length}
                            </span>
                          </div>

                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                progress.percentage >=
                                80
                                  ? "bg-teal-600"
                                  : progress.percentage >=
                                    50
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${progress.percentage}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-4">

                          <div className="flex items-center gap-2 flex-wrap">

                            {student.batch?.name && (
                              <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg">
                                {student.batch.name}
                              </span>
                            )}

                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full ${
                                statusColors[
                                  progress.status
                                ]
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  statusDotColors[
                                    progress.status
                                  ]
                                }`}
                              />

                              {progress.status}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedStudentId(
                                student._id
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* =================================================
            SELECTED STUDENT DETAIL
        ================================================= */}

        {selectedStudent && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* DETAIL HEADER */}

            <div className="p-6 border-b border-gray-100">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div className="flex items-center gap-4">

                  {selectedStudent.avatarUrl ? (
                    <img
                      src={selectedStudent.avatarUrl}
                      alt={selectedStudent.name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center text-xl font-bold">
                      {selectedStudent.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedStudent.name}
                      </h2>

                      {selectedStudent.isActive !==
                        false && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mt-0.5">
                      {selectedStudent.email}
                    </p>

                    {selectedStudent.batch?.name && (
                      <p className="text-xs text-teal-700 mt-1">
                        {selectedStudent.batch.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-400">
                    Overall Progress
                  </p>

                  <p className="text-3xl font-bold text-teal-700">
                    {
                      progressSummary.completionPercentage
                    }
                    %
                  </p>
                </div>
              </div>

              {/* SUMMARY */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

                <div className="bg-teal-50 rounded-xl p-3">
                  <p className="text-xs text-teal-600">
                    Completed
                  </p>

                  <p className="text-xl font-bold text-teal-800">
                    {
                      progressSummary.completed
                    }
                  </p>
                </div>

                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-600">
                    In Progress
                  </p>

                  <p className="text-xl font-bold text-orange-700">
                    {
                      progressSummary.inProgress
                    }
                  </p>
                </div>

                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-red-600">
                    Needs Improvement
                  </p>

                  <p className="text-xl font-bold text-red-700">
                    {
                      progressSummary.needsImprovement
                    }
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    Not Started
                  </p>

                  <p className="text-xl font-bold text-gray-700">
                    {
                      progressSummary.notStarted
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                LEARNING MODULES
            ================================================= */}

            <div className="p-6">

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Learning Modules
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Update this student's progress by topic.
                  </p>
                </div>

                {saving && (
                  <span className="text-xs font-medium text-teal-700">
                    Saving...
                  </span>
                )}
              </div>

              <div className="space-y-3">

                {topics.map((topic, index) => {
                  const record =
                    getTopicRecord(topic);

                  const currentStatus =
                    record?.status ||
                    "Not Started";

                  return (
                    <div
                      key={topic}
                      className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                    >

                      <div className="flex items-center gap-3 flex-1">

                        <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {index + 1}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800">
                            {topic}
                          </p>

                          {record?.week && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Week {record.week}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">

                        <span
                          className={`hidden sm:inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
                            statusColors[
                              currentStatus
                            ]
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              statusDotColors[
                                currentStatus
                              ]
                            }`}
                          />

                          {currentStatus}
                        </span>

                        <select
                          value={currentStatus}
                          disabled={saving}
                          onChange={(e) =>
                            handleStatusChange(
                              topic,
                              e.target.value
                            )
                          }
                          className={`text-xs px-3 py-2 rounded-lg border-0 cursor-pointer outline-none ${
                            statusColors[
                              currentStatus
                            ]
                          }`}
                        >
                          {statusOptions.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                MENTOR NOTE
            ================================================= */}

            <div className="border-t border-gray-100 p-6">

              <h3 className="font-semibold text-gray-900 mb-1">
                Mentor Note
              </h3>

              <p className="text-xs text-gray-400 mb-3">
                Add feedback or observations about this
                student's learning progress.
              </p>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                rows={4}
                placeholder="Example: Struggling with async/await. Needs additional practice..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
              />

              <div className="flex justify-end mt-3">

                <button
                  onClick={handleSaveNote}
                  disabled={
                    saving ||
                    !note.trim()
                  }
                  className="bg-teal-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving
                    ? "Saving..."
                    : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-10" />
      </main>

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default Progress;