import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../utils/api";
import {
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH STUDENTS
  // =========================
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");
       const response = await API.get("/mentor/students");

      console.log(
        "🔥 BROWSER RESPONSE:",
      JSON.stringify(response.data, null, 2)
     );

     setStudents(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load students. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // =========================
  // FILTER STUDENTS
  // =========================
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        student.name?.toLowerCase().includes(searchValue) ||
        student.email?.toLowerCase().includes(searchValue);

      const matchesGender =
        gender === "All" || student.gender === gender;

      const matchesStatus =
        status === "All" ||
        (status === "Active" && student.isActive === true) ||
        (status === "Inactive" && student.isActive === false);

      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [students, search, gender, status]);

  // =========================
  // STATISTICS
  // =========================
  const activeStudents = students.filter(
    (student) => student.isActive === true
  ).length;

  const inactiveStudents = students.filter(
    (student) => student.isActive === false
  ).length;

  // =========================
  // INITIALS
  // =========================
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =========================
  // ATTENDANCE
  // =========================
  // Attendance is not yet returned by the backend,
  // so we temporarily display "N/A".
  const getAttendance = (student) => {
    if (
      student.attendance === undefined ||
      student.attendance === null
    ) {
      return null;
    }

    return Number(student.attendance);
  };

  const getAttendanceColor = (attendance) => {
    if (attendance === null) return "text-gray-400";
    if (attendance < 65) return "text-red-500";
    if (attendance < 80) return "text-yellow-600";
    return "text-green-600";
  };

  const getAttendanceBar = (attendance) => {
    if (attendance === null) return "bg-gray-300";
    if (attendance < 65) return "bg-red-500";
    if (attendance < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">

        {/* ================= HEADER ================= */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">
            My Students
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor students assigned to your track.
          </p>
        </div>

        {/* ================= STATISTICS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* TOTAL */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Students
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {students.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users
                  size={21}
                  className="text-blue-600"
                />
              </div>

            </div>
          </div>

          {/* ACTIVE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Active Students
                </p>

                <p className="text-2xl font-bold text-green-600 mt-2">
                  {activeStudents}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <UserCheck
                  size={21}
                  className="text-green-600"
                />
              </div>

            </div>
          </div>

          {/* INACTIVE */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Inactive Students
                </p>

                <p className="text-2xl font-bold text-red-500 mt-2">
                  {inactiveStudents}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <UserX
                  size={21}
                  className="text-red-500"
                />
              </div>

            </div>
          </div>

        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* FILTERS */}
          <div className="p-5 border-b border-gray-100">

            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

              {/* SEARCH */}
              <div className="relative w-full lg:max-w-md">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />

              </div>

              {/* FILTERS */}
              <div className="flex flex-col sm:flex-row gap-3">

                <div className="flex items-center gap-2 text-gray-500">
                  <SlidersHorizontal size={17} />

                  <span className="text-sm">
                    Filters
                  </span>
                </div>

                {/* GENDER */}
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value)
                  }
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="All">
                    All Genders
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>
                </select>

                {/* STATUS */}
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

              </div>

            </div>
          </div>

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="p-14 text-center">

              <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mx-auto" />

              <p className="text-sm text-gray-500 mt-4">
                Loading students...
              </p>

            </div>
          )}

          {/* ================= ERROR ================= */}
          {!loading && error && (
            <div className="p-10 text-center">

              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">

                <UserRound
                  size={22}
                  className="text-red-500"
                />

              </div>

              <h3 className="font-medium text-gray-800 mt-3">
                Unable to load students
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {error}
              </p>

            </div>
          )}

          {/* ================= TABLE ================= */}
          {!loading && !error && (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">

                    <th className="px-6 py-4 font-medium">
                      Student
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Gender
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Attendance
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Batch
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredStudents.length > 0 ? (

                    filteredStudents.map((student) => {

                      const attendance =
                        getAttendance(student);

                      return (
                        <tr
                          key={student._id}
                          className="border-t border-gray-100 hover:bg-gray-50 transition"
                        >

                          {/* STUDENT */}
                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-semibold">
                                {getInitials(student.name)}
                              </div>

                              <div>

                                <p className="font-medium text-gray-900">
                                  {student.name}
                                </p>

                                <p className="text-xs text-gray-500 mt-0.5">
                                  {student.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* GENDER */}
                          <td className="px-6 py-4 text-gray-600">
                            {student.gender || "Not specified"}
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                student.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >

                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  student.isActive
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />

                              {student.isActive
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>

                          {/* ATTENDANCE */}
                          <td className="px-6 py-4">

                            {attendance === null ? (

                              <span className="text-gray-400 text-sm">
                                N/A
                              </span>

                            ) : (

                              <div className="flex items-center gap-3 min-w-[150px]">

                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">

                                  <div
                                    className={`h-full rounded-full ${getAttendanceBar(
                                      attendance
                                    )}`}
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          attendance,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  />

                                </div>

                                <span
                                  className={`font-semibold ${getAttendanceColor(
                                    attendance
                                  )}`}
                                >
                                  {attendance}%
                                </span>

                              </div>

                            )}

                          </td>

                          {/* BATCH */}
                          <td className="px-6 py-4">

                            <div>

                              <p className="font-medium text-gray-700">
                                {student.batch?.name ||
                                  "No batch"}
                              </p>

                              <p className="text-xs text-gray-400 mt-0.5">
                                {student.batch?.track || "—"}
                              </p>

                            </div>

                          </td>

                        </tr>
                      );
                    })

                  ) : (

                    <tr>

                      <td
                        colSpan="5"
                        className="px-6 py-14 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">

                            <UserRound
                              size={22}
                              className="text-gray-400"
                            />

                          </div>

                          <h3 className="font-medium text-gray-800">
                            No students found
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Try changing your search or filters.
                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>
          )}

          {/* ================= FOOTER ================= */}
          {!loading && !error && (
            <div className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">

              Showing{" "}

              <span className="font-medium text-gray-800">
                {filteredStudents.length}
              </span>

              {" "}of{" "}

              <span className="font-medium text-gray-800">
                {students.length}
              </span>

              {" "}students

            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default MyStudents;