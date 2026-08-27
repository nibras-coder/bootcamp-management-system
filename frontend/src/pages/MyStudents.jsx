import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Users, Search, Loader2, Mail, Phone, BookOpen, AlertCircle , Menu } from "lucide-react";

function MyStudents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/mentor/students");
      if (res.data.success) {
        setStudents(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load mentor students:", err);
      // Fallback
      try {
        const res2 = await API.get("/users/mentor/students");
        if (res2.data.success) setStudents(res2.data.data || []);
      } catch (err2) {
        toast.error("Failed to load students");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.batch?.name && s.batch.name.toLowerCase().includes(q)) ||
      (s.batch?.track && s.batch.track.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-teal-900 dark:bg-black text-white mb-5 rounded-xl border border-teal-800 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-teal-800 text-teal-200"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold text-sm">MyStudents</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Users className="text-teal-600 dark:text-teal-400" size={26} />
              My Students
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              All students enrolled in your mentorship tracks ({students.length} Total)
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or track..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-3 text-teal-600" size={32} />
            <p className="text-sm">Loading your students...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Track / Batch</th>
                    <th className="px-6 py-3.5">Contact</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredStudents.length ? (
                    filteredStudents.map((student) => (
                      <tr
                        key={student._id || student.email}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                              {(student.name || "S").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</p>
                              <p className="text-xs text-gray-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                            <BookOpen size={12} />
                            {student.batch?.name || student.batch?.track || "Assigned Track"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                          {student.phone ? (
                            <span className="flex items-center gap-1.5">
                              <Phone size={13} className="text-gray-400" />
                              {student.phone}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <Mail size={13} />
                              {student.email}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm">
                        {search ? "No students found matching your search." : "No students assigned to your track yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyStudents;
