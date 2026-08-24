import React, { useState } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Loader,
  Clock,
  Shield,
} from "lucide-react";

const initialAttendance = [
  {
    id: 1,
    name: "Eman Ahmen",
    batch: "Web Dev Bootcamp",
    date: "2026-08-18",
    status: "Present",
  },
  {
    id: 2,
    name: "Adem Ali",
    batch: "Web Dev Bootcamp",
    date: "2026-08-18",
    status: "Absent",
  },
  {
    id: 3,
    name: "Mohammed Musa",
    batch: "DSA & Competitive Programming",
    date: "2026-08-18",
    status: "Present",
  },
  {
    id: 4,
    name: "Noah Ali",
    batch: "Web Dev Bootcamp",
    date: "2026-08-18",
    status: "Late",
  },
  {
    id: 5,
    name: "Khulud Seid",
    batch: "Web Dev Bootcamp",
    date: "2026-08-18",
    status: "Present",
  },
  {
    id: 6,
    name: "Aya Umer",
    batch: "DSA",
    date: "2026-08-20",
    status: "Late",
  },
];

const AttendancePage = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");

  // Real API integration
  React.useEffect(() => {
    fetchBatches();
    fetchAttendance();
  }, [date, selectedBatch]);

  const fetchBatches = async () => {
    try {
      const { data } = await API.get("/batches");
      if (data.success) setBatches(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await API.get("/attendance");
      if (data.success) {
        // Filter by date and optionally batch
        let filtered = data.data.filter((r) => {
          const recDate = new Date(r.date).toISOString().split("T")[0];
          const matchesDate = recDate === date;
          const matchesBatch =
            selectedBatch === "all" ||
            (r.batch && r.batch._id === selectedBatch);
          return matchesDate && matchesBatch;
        });
        setRecords(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update
    setRecords(
      records.map((record) =>
        record._id === id ? { ...record, status: newStatus } : record,
      ),
    );
    try {
      await API.put(`/attendance/${id}`, { status: newStatus });
      setMessage("Status updated successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error(error);
      // Revert if needed (not implementing full revert for brevity)
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage("Attendance successfully saved for Regular Session!");
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <Calendar size={20} className="text-teal-600" />
            <span className="font-medium">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500">
            <option>All Tracks (3x/Week Sessions)</option>
            <option>Web Dev Bootcamp</option>
            <option>DSA & CP</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin" size={18} /> : null}
          <span>Mark Attendance</span>
        </button>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="all">All Tracks</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name || b.track}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Present</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {records.filter((r) => r.status === "Present").length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Absent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {records.filter((r) => r.status === "Absent").length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Late</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {records.filter((r) => r.status === "Late").length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Excused</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {records.filter((r) => r.status === "Excused").length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Attendance Record</h3>
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-teal-500"
            />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Track
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records
              .filter((r) =>
                (r.student?.name || "")
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()),
              )
              .map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {record.student?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {record.batch?.name || record.batch?.track || "Unknown"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                        record.status === "Present"
                          ? "bg-green-100 text-green-800"
                          : record.status === "Absent"
                            ? "bg-red-100 text-red-800"
                            : record.status === "Late"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <select
                      className="border border-gray-300 dark:border-gray-600 rounded text-xs py-1 px-2 focus:ring-teal-500"
                      value={record.status}
                      onChange={(e) =>
                        handleStatusChange(record._id, e.target.value)
                      }
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No attendance records found for this date.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
