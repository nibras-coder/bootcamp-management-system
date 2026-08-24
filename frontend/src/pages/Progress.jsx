import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";

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

  // --------------------------------------------------
  // FETCH STUDENTS
  // --------------------------------------------------

  const fetchStudents = async () => {
    try {
      const res = await api.get("/mentor/students");

      const studentData = res.data.data || [];

      setStudents(studentData);

      if (studentData.length > 0) {
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

  // --------------------------------------------------
  // FETCH PROGRESS
  // --------------------------------------------------

  const fetchProgress = async () => {
    try {
      const res = await api.get("/progress");

      const progressData = res.data.data || [];

      setRecords(progressData);
    } catch (error) {
      console.error("Failed to load progress:", error);

      setToast({
        type: "error",
        message: "Failed to load progress",
      });
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

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

  // --------------------------------------------------
  // BATCH LIST
  // --------------------------------------------------

  const batches = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      if (student.batch?._id) {
        map.set(student.batch._id, student.batch);
      }
    });

    return Array.from(map.values());
  }, [students]);

  // --------------------------------------------------
  // WEEK LIST
  // --------------------------------------------------

  const weeks = useMemo(() => {
    const uniqueWeeks = [
      ...new Set(records.map((record) => record.week)),
    ];

    return uniqueWeeks.sort((a, b) => a - b);
  }, [records]);

  // --------------------------------------------------
  // FILTER RECORDS
  // --------------------------------------------------

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesTopic =
        topicFilter === "all" ||
        record.topic === topicFilter;

      const matchesStatus =
        statusFilter === "all" ||
        record.status === statusFilter;

      const matchesWeek =
        weekFilter === "all" ||
        String(record.week) === String(weekFilter);

      return (
        matchesTopic &&
        matchesStatus &&
        matchesWeek
      );
    });
  }, [
    records,
    topicFilter,
    statusFilter,
    weekFilter,
  ]);

  // --------------------------------------------------
  // FILTER STUDENTS
  // --------------------------------------------------

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchValue = search.toLowerCase().trim();

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

      return (
        matchesSearch &&
        matchesBatch
      );
    });
  }, [
    students,
    search,
    batchFilter,
  ]);

  // --------------------------------------------------
  // SELECTED STUDENT
  // --------------------------------------------------

  const selectedStudent = students.find(
    (student) =>
      student._id === selectedStudentId,
  );

  // --------------------------------------------------
  // SELECTED STUDENT RECORDS
  // --------------------------------------------------

  const selectedStudentRecords = useMemo(() => {
    if (!selectedStudentId) return [];

    return records.filter(
      (record) =>
        record.student?._id === selectedStudentId,
    );
  }, [records, selectedStudentId]);

  // --------------------------------------------------
  // PROGRESS SUMMARY
  // --------------------------------------------------

  const progressSummary = useMemo(() => {
    const completed = selectedStudentRecords.filter(
      (record) =>
        record.status === "Completed",
    ).length;

    const inProgress = selectedStudentRecords.filter(
      (record) =>
        record.status === "In Progress",
    ).length;

    const needsImprovement =
      selectedStudentRecords.filter(
        (record) =>
          record.status ===
          "Needs Improvement",
      ).length;

    const notStarted = selectedStudentRecords.filter(
      (record) =>
        record.status === "Not Started",
    ).length;

    const total = topics.length;

    const completionPercentage =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      total,
      completed,
      inProgress,
      needsImprovement,
      notStarted,
      completionPercentage,
    };
  }, [selectedStudentRecords]);

  // --------------------------------------------------
  // GET TOPIC STATUS
  // --------------------------------------------------

  const getTopicRecord = (topic) => {
    const topicRecords =
      selectedStudentRecords.filter(
        (record) =>
          record.topic === topic,
      );

    if (topicRecords.length === 0) {
      return null;
    }

    // Latest record
    return [...topicRecords].sort(
      (a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt),
    )[0];
  };

  // --------------------------------------------------
  // CHANGE STATUS
  // --------------------------------------------------

  const handleStatusChange = async (
    topic,
    newStatus,
  ) => {
    if (!selectedStudent) return;

    const existingRecord =
      getTopicRecord(topic);

    try {
      setSaving(true);

      // If progress already exists
      if (existingRecord) {
        await api.put(
          `/progress/${existingRecord._id}`,
          {
            status: newStatus,
          },
        );
      } else {
        // Create new progress record
        await api.post("/progress", {
          student: selectedStudent._id,
          batch: selectedStudent.batch?._id,
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
        error,
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

  // --------------------------------------------------
  // SAVE NOTE
  // --------------------------------------------------

  const handleSaveNote = async () => {
    if (!selectedStudent || !note.trim()) {
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
          },
        );
      } else {
        await api.post("/progress", {
          student: selectedStudent._id,
          batch: selectedStudent.batch?._id,
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
        error,
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

  // --------------------------------------------------
  // GLOBAL STATISTICS
  // --------------------------------------------------

  const statistics = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let needsImprovement = 0;
    let notStarted = 0;

    filteredStudents.forEach((student) => {
      const studentRecords =
        records.filter(
          (record) =>
            record.student?._id ===
            student._id,
        );

      studentRecords.forEach((record) => {
        if (record.status === "Completed") {
          completed++;
        }

        if (record.status === "In Progress") {
          inProgress++;
        }

        if (
          record.status ===
          "Needs Improvement"
        ) {
          needsImprovement++;
        }

        if (record.status === "Not Started") {
          notStarted++;
        }
      });
    });

    return {
      students: filteredStudents.length,
      completed,
      inProgress,
      needsImprovement,
      notStarted,
    };
  }, [filteredStudents, records]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

              <p className="text-gray-500 text-sm">
                Loading progress...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Progress Management
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Track and manage student learning progress
              by topic.
            </p>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400">
              Students
            </p>

            <p className="text-xl font-bold text-teal-800">
              {statistics.students}
            </p>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="text-2xl font-bold text-teal-700 mt-1">
              {statistics.completed}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              In Progress
            </p>

            <p className="text-2xl font-bold text-orange-500 mt-1">
              {statistics.inProgress}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Needs Improvement
            </p>

            <p className="text-2xl font-bold text-red-500 mt-1">
              {statistics.needsImprovement}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Not Started
            </p>

            <p className="text-2xl font-bold text-gray-500 mt-1">
              {statistics.notStarted}
            </p>
          </div>
        </div>

        {/* FILTERS */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="font-semibold text-gray-900">
                Student Progress
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Search and filter students
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">

            {/* SEARCH */}

            <div className="relative lg:col-span-2">

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
              />
            </div>

            {/* BATCH */}

            <select
              value={batchFilter}
              onChange={(e) =>
                setBatchFilter(e.target.value)
              }
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-100"
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

            {/* TOPIC */}

            <select
              value={topicFilter}
              onChange={(e) =>
                setTopicFilter(e.target.value)
              }
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-100"
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

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">
                All Statuses
              </option>

              {statusOptions.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* WEEK FILTER */}

          {weeks.length > 0 && (
            <div className="mt-3">

              <select
                value={weekFilter}
                onChange={(e) =>
                  setWeekFilter(e.target.value)
                }
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-100"
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

            </div>
          )}
        </div>

        {/* STUDENTS */}

        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">

            <div className="text-5xl mb-4">
              👨‍🎓
            </div>

            <h3 className="font-semibold text-gray-800">
              No students found
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Try changing your search or filters.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">

            {filteredStudents.map((student) => {

              const studentRecords =
                records.filter(
                  (record) =>
                    record.student?._id ===
                    student._id,
                );

              const completed =
                studentRecords.filter(
                  (record) =>
                    record.status ===
                    "Completed",
                ).length;

              const percentage =
                Math.round(
                  (completed / topics.length) *
                    100,
                );

              return (
                <button
                  key={student._id}
                  onClick={() =>
                    setSelectedStudentId(
                      student._id,
                    )
                  }
                  className={`text-left bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${
                    selectedStudentId ===
                    student._id
                      ? "border-teal-600 ring-2 ring-teal-50"
                      : "border-gray-100"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                        {student.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {student.name}
                        </h3>

                        <p className="text-xs text-gray-400">
                          {student.email}
                        </p>
                      </div>

                    </div>

                    <span className="text-sm font-bold text-teal-700">
                      {percentage}%
                    </span>

                  </div>

                  <div className="mt-4">

                    <div className="flex justify-between text-xs mb-1">

                      <span className="text-gray-400">
                        Completion
                      </span>

                      <span className="text-gray-500">
                        {completed}/{topics.length}
                      </span>

                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-teal-700 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="flex gap-2 mt-4 flex-wrap">

                    {student.batch?.name && (
                      <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full">
                        {student.batch.name}
                      </span>
                    )}

                    {student.isActive !== undefined && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          student.isActive
                            ? "bg-teal-50 text-teal-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {student.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    )}

                  </div>

                </button>
              );
            })}

          </div>
        )}

        {/* SELECTED STUDENT */}

        {selectedStudent && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* STUDENT HEADER */}

            <div className="p-6 border-b border-gray-100">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center text-xl font-bold">
                    {selectedStudent.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedStudent.name}
                    </h2>

                    <p className="text-sm text-gray-400">
                      {selectedStudent.email}
                    </p>

                    {selectedStudent.batch?.name && (
                      <p className="text-xs text-teal-700 mt-1">
                        {selectedStudent.batch.name}
                      </p>
                    )}

                  </div>

                </div>

                <div className="text-right">

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

            {/* TOPICS */}

            <div className="p-6">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Learning Modules
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Update the student's progress
                    for each topic.
                  </p>
                </div>

                {saving && (
                  <span className="text-xs text-teal-700">
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

                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {index + 1}
                        </div>

                        <div>

                          <p className="font-medium text-gray-800">
                            {topic}
                          </p>

                          {record?.week && (
                            <p className="text-xs text-gray-400">
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
                              e.target.value,
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
                            ),
                          )}

                        </select>

                      </div>

                    </div>
                  );
                })}

              </div>
            </div>

            {/* NOTE */}

            <div className="border-t border-gray-100 p-6">

              <h3 className="font-semibold text-gray-900 mb-1">
                Mentor Note
              </h3>

              <p className="text-xs text-gray-400 mb-3">
                Add feedback or observations about
                this student's learning progress.
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

      </main>

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default Progress;