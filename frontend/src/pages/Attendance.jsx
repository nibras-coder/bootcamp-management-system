import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../utils/api";
import {
  Search,
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Clock3,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

const statusOptions = [
  "Present",
  "Absent",
  "Late",
  "Excused",
];

const statusStyles = {
  Present: "bg-green-50 text-green-700 border-green-200",
  Absent: "bg-red-50 text-red-600 border-red-200",
  Late: "bg-orange-50 text-orange-600 border-orange-200",
  Excused: "bg-blue-50 text-blue-600 border-blue-200",
};

const getAttendanceColor = (attendance) => {
  if (attendance < 65) return "text-red-500";
  if (attendance < 80) return "text-yellow-600";
  return "text-green-600";
};

const getProgressColor = (attendance) => {
  if (attendance < 65) return "bg-red-500";
  if (attendance < 80) return "bg-yellow-500";
  return "bg-green-500";
};

const getInitials = (name) => {
  return name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

function Attendance() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [search, setSearch] = useState("");

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
   
   * LOAD BATCHES
   
   */

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoadingBatches(true);
        setError("");

        const response = await API.get("/batches");

        const allBatches = response.data.data || [];

        // Only batches where current mentor is assigned
        const token = localStorage.getItem("token");

        let mentorId = null;

        if (token) {
          try {
            const payload = JSON.parse(
              atob(token.split(".")[1])
            );

            mentorId = payload.id;
          } catch (error) {
            console.error(
              "Could not decode token",
              error
            );
          }
        }

        const mentorBatches = allBatches.filter(
          (batch) =>
            batch.mentors?.some(
              (mentor) =>
                mentor._id === mentorId ||
                mentor === mentorId
            )
        );

        setBatches(mentorBatches);

        if (mentorBatches.length > 0) {
          setSelectedBatch(mentorBatches[0]._id);
        }
      } catch (error) {
        console.error(
          "Failed to load batches:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load batches."
        );
      } finally {
        setLoadingBatches(false);
      }
    };

    loadBatches();
  }, []);

  /*
  
   * LOAD STUDENTS + ATTENDANCe
   */

  useEffect(() => {
    if (!selectedBatch) return;

    const loadAttendance = async () => {
      try {
        setLoadingStudents(true);
        setError("");

        /*
         * Get students for selected batch
         */
        const studentsResponse = await API.get(
          `/batches/${selectedBatch}/students`
        );

        const batchStudents =
          studentsResponse.data.data || [];

        /*
         * Get all attendance records
         */
        const attendanceResponse =
          await API.get("/attendance");

        const attendanceRecords =
          attendanceResponse.data.data || [];

        /*
         * Calculate attendance for every student
         */
        const formattedStudents =
          batchStudents.map((student) => {
            const studentRecords =
              attendanceRecords.filter(
                (record) => {
                  const recordStudent =
                    record.student?._id ||
                    record.student;

                  const recordBatch =
                    record.batch?._id ||
                    record.batch;

                  return (
                    recordStudent === student._id &&
                    recordBatch === selectedBatch
                  );
                }
              );

            /*
             * Attendance percentage
             *
             * Present + Late = attended
             */
            const total =
              studentRecords.length;

            const attended =
              studentRecords.filter(
                (record) =>
                  record.status === "Present" ||
                  record.status === "Late"
              ).length;

            const percentage =
              total > 0
                ? Math.round(
                    (attended / total) * 100
                  )
                : 0;

            /*
             * Find today's attendance
             */
            const todayRecord =
              studentRecords.find((record) => {
                const recordDate =
                  new Date(record.date)
                    .toISOString()
                    .split("T")[0];

                return recordDate === date;
              });

            return {
              id: student._id,
              name: student.name,
              email: student.email,
              isActive: student.isActive,

              attendance: percentage,

              status:
                todayRecord?.status ||
                "Present",

              note:
                todayRecord?.note || "",

              attendanceId:
                todayRecord?._id || null,
            };
          });

        setStudents(formattedStudents);
      } catch (error) {
        console.error(
          "Failed to load attendance:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load attendance."
        );
      } finally {
        setLoadingStudents(false);
      }
    };

    loadAttendance();
  }, [selectedBatch, date]);

  /*
  
   * CHANGE STATUS

   */

  const handleStatusChange = (
    studentId,
    newStatus
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status: newStatus,
            }
          : student
      )
    );
  };

  /*

   * CHANGE NOTE

   */

  const handleNoteChange = (
    studentId,
    note
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              note,
            }
          : student
      )
    );
  };

  /*
   
   * SAVE ATTENDANCE
   
   */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      /*
       * Save each student's attendance
       *
       * Existing record → PUT
       * New record → POST
       */

      for (const student of students) {
        const attendanceData = {
          student: student.id,
          batch: selectedBatch,
          date,
          status: student.status,
          note: student.note || "",
        };

        if (student.attendanceId) {
          /*
           * Update existing attendance
           */
          await API.put(
            `/attendance/${student.attendanceId}`,
            {
              status: student.status,
              note: student.note || "",
            }
          );
        } else {
          /*
           * Create new attendance
           */
          const response = await API.post(
            "/attendance",
            attendanceData
          );

          /*
           * Store newly-created attendance ID
           * so future saves update instead of
           * creating another record.
           */

          const newAttendanceId =
            response.data.data?._id;

          setStudents((prev) =>
            prev.map((item) =>
              item.id === student.id
                ? {
                    ...item,
                    attendanceId:
                      newAttendanceId,
                  }
                : item
            )
          );
        }
      }

      alert(
        "Attendance saved successfully!"
      );
    } catch (error) {
      console.error(
        "Failed to save attendance:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  /*

   * SEARCH
   */

  const filteredStudents = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) return students;

    return students.filter(
      (student) =>
        student.name
          .toLowerCase()
          .includes(value) ||
        student.email
          .toLowerCase()
          .includes(value)
    );
  }, [students, search]);

  /*
   * SUMMAry
   */

  const presentCount = students.filter(
    (student) =>
      student.status === "Present"
  ).length;

  const absentCount = students.filter(
    (student) =>
      student.status === "Absent"
  ).length;

  const lateCount = students.filter(
    (student) =>
      student.status === "Late"
  ).length;

  const excusedCount = students.filter(
    (student) =>
      student.status === "Excused"
  ).length;

  const attendancePercent =
    students.length > 0
      ? Math.round(
          ((presentCount + lateCount) /
            students.length) *
            100
        )
      : 0;

  /*
   * SELECTED BATCH NAME
   */

  const selectedBatchData = batches.find(
    (batch) =>
      batch._id === selectedBatch
  );

  /*
   
   * UI
   */

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">
        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Track and manage student attendance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <CalendarDays
              size={17}
              className="text-gray-400"
            />

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="text-sm text-gray-700 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3">
            <AlertCircle size={18} />

            <span className="text-sm">
              {error}
            </span>
          </div>
        )}

        {/* FILTERS */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
            {/* Batch */}

            <div className="w-full md:w-72">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Batch
              </label>

              <select
                value={selectedBatch}
                onChange={(e) =>
                  setSelectedBatch(
                    e.target.value
                  )
                }
                disabled={loadingBatches}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
              >
                {loadingBatches ? (
                  <option>
                    Loading batches...
                  </option>
                ) : batches.length === 0 ? (
                  <option>
                    No batches assigned
                  </option>
                ) : (
                  batches.map((batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Search */}

            <div className="w-full md:max-w-sm">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Search students
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <SummaryCard
            label="Total"
            value={students.length}
            icon={<Users size={19} />}
            iconClass="bg-gray-100 text-gray-600"
          />

          <SummaryCard
            label="Present"
            value={presentCount}
            icon={<UserCheck size={19} />}
            iconClass="bg-green-50 text-green-600"
          />

          <SummaryCard
            label="Absent"
            value={absentCount}
            icon={<UserX size={19} />}
            iconClass="bg-red-50 text-red-500"
          />

          <SummaryCard
            label="Late"
            value={lateCount}
            icon={<Clock3 size={19} />}
            iconClass="bg-orange-50 text-orange-500"
          />

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
            <p className="text-xs text-gray-500">
              Today's Rate
            </p>

            <p className="text-xl font-bold text-teal-700 mt-1">
              {attendancePercent}%
            </p>

            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full"
                style={{
                  width: `${attendancePercent}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Daily Attendance
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {selectedBatchData?.name ||
                    "Select a batch"}{" "}
                  · {date}
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {filteredStudents.length} students
              </span>
            </div>
          </div>

          {loadingStudents ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-teal-700"
              />

              <p className="text-sm text-gray-500 mt-3">
                Loading attendance...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center">
              <Users
                size={35}
                className="mx-auto text-gray-300"
              />

              <p className="font-medium text-gray-700 mt-3">
                No students found
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Try changing your search or batch.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="px-6 py-4 font-medium">
                      Student
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Overall Attendance
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Today's Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Note
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(
                    (student) => (
                      <tr
                        key={student.id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >
                        {/* STUDENT */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-semibold">
                              {getInitials(
                                student.name
                              )}
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name}
                              </p>

                              <p className="text-xs text-gray-500 mt-0.5">
                                {student.email}
                              </p>

                              {!student.isActive && (
                                <span className="text-[11px] text-red-500">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* OVERALL ATTENDANCE */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getProgressColor(
                                  student.attendance
                                )}`}
                                style={{
                                  width: `${student.attendance}%`,
                                }}
                              />
                            </div>

                            <span
                              className={`font-semibold ${getAttendanceColor(
                                student.attendance
                              )}`}
                            >
                              {student.attendance}%
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <select
                            value={student.status}
                            onChange={(e) =>
                              handleStatusChange(
                                student.id,
                                e.target.value
                              )
                            }
                            className={`px-3 py-2 rounded-lg border text-xs font-medium outline-none cursor-pointer ${statusStyles[student.status]}`}
                          >
                            {statusOptions.map(
                              (option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        {/* NOTE */}

                        <td className="px-6 py-4">
                          <input
                            type="text"
                            placeholder="Add note..."
                            value={
                              student.note
                            }
                            onChange={(e) =>
                              handleNoteChange(
                                student.id,
                                e.target.value
                              )
                            }
                            className="w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* FOOTER */}

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={
                saving ||
                loadingStudents ||
                students.length === 0
              }
              className="flex items-center gap-2 bg-teal-800 hover:bg-teal-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Save Attendance
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">
            {label}
          </p>

          <p className="text-xl font-bold text-gray-900 mt-1">
            {value}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Attendance;