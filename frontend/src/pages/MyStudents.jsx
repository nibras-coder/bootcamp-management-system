import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
<<<<<<< HEAD
import api from "../utils/api";
import { Search } from "lucide-react";
=======

const students = [
  {
    name: "Abel Tesfaye",
    email: "abel@gmailcom",
    attendance: 55,
    progress: "In Progress",
  },
  {
    name: "Mekdes Alemu",
    email: "mekdes@gmailcom",
    attendance: 60,
    progress: "In Progress",
  },
  {
    name: "Daniel Worku",
    email: "daniel@gmailcom",
    attendance: 62,
    progress: "Needs Improvement",
  },
  {
    name: "Sara Ali",
    email: "sara@gmailcom",
    attendance: 91,
    progress: "Completed",
  },
];
>>>>>>> origin/main

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Backend automatically restricts this to the logged-in mentor's own batches
        const res = await api.get("/users", { params: { role: "student" } });
        setStudents(res.data.users);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Live filter — filters the already-fetched list as the mentor types,
  // no extra network request needed for a simple name/email search.
  const filteredStudents = students.filter((student) => {
    const term = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
<<<<<<< HEAD
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-500 text-sm">Students assigned to your batch.</p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm w-72"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          {loading && <p className="text-gray-500 text-sm">Loading students...</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {!loading && !error && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-normal">Name</th>
                  <th className="pb-3 font-normal">Email</th>
                  <th className="pb-3 font-normal">Phone</th>
=======
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Students</h1>
        <p className="text-gray-500 text-sm mb-6">
          Students assigned to your Track.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-normal">Name</th>
                <th className="pb-3 font-normal">Email</th>
                <th className="pb-3 font-normal">Attendance</th>
                <th className="pb-3 font-normal">Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.email}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 text-gray-800">{student.name}</td>
                  <td className="py-3 text-gray-600">{student.email}</td>
                  <td className="py-3">
                    <span
                      className={
                        student.attendance < 65
                          ? "text-red-500"
                          : "text-teal-700"
                      }
                    >
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{student.progress}</td>
>>>>>>> origin/main
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-800">{student.name}</td>
                    <td className="py-3 text-gray-600">{student.email}</td>
                    <td className="py-3 text-gray-600">{student.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && !error && filteredStudents.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">
              {search ? "No students match your search." : "No students assigned yet."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyStudents;
