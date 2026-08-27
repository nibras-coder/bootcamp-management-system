import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Loader,
  Clock,
  Shield,
  Save,
  Users,
} from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const AttendancePage = () => {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [date, selectedBatch]);

  const fetchBatches = async () => {
    try {
      const response = await API.get("/batches");
      if (response.data.success) {
        setBatches(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await API.get("/attendance");
      if (response.data.success) {
        const allRecords = response.data.data || [];
        const filtered = allRecords.filter((r) => {
          const recDate = r.date ? new Date(r.date).toISOString().split("T")[0] : "";
          const matchesDate = recDate === date;
          const batchId = r.batch?._id || r.batch;
          const matchesBatch =
            selectedBatch === "all" || batchId === selectedBatch;
          return matchesDate && matchesBatch;
        });
        setRecords(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (recordId, newStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r._id === recordId ? { ...r, status: newStatus } : r))
    );
    
    if (String(recordId).startsWith("temp-")) {
      return;
    }

    try {
      await API.put(`/attendance/${recordId}`, { status: newStatus });
      toast.success("Attendance status updated");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
      fetchAttendance();
    }
  };

  const handleLoadStudentsForMarking = async () => {
    if (selectedBatch === "all") {
      toast.warning("Please select a specific track to mark attendance");
      return;
    }
    setLoading(true);
    try {
      const response = await API.get(`/batches/${selectedBatch}/students`);
      if (response.data.success && response.data.data.length > 0) {
        const batchStudentsList = response.data.data;
        const newRecords = batchStudentsList.map((st) => ({
          _id: `temp-${st._id}`,
          student: { _id: st._id, name: st.name, email: st.email },
          batch: { _id: selectedBatch, name: batches.find(b => b._id === selectedBatch)?.name || "Selected Track" },
          status: "Present",
          date: date,
          isNew: true,
        }));
        setRecords(newRecords);
        toast.info(`Loaded ${batchStudentsList.length} students. Set statuses and click Save Attendance.`);
      } else {
        toast.warning("No students found in this track.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load track students");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (records.length === 0) {
      toast.warning("No attendance records to save");
      return;
    }
    setSaving(true);
    try {
      let savedCount = 0;
      for (const rec of records) {
        if (rec.isNew) {
          await API.post("/attendance", {
            student: rec.student._id,
            batch: rec.batch._id || selectedBatch,
            date: date,
            status: rec.status,
          });
          savedCount++;
        }
      }
      toast.success(`Saved attendance for ${savedCount || records.length} students!`);
      await fetchAttendance();
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error(error.response?.data?.message || "Attendance saved or partially recorded.");
      await fetchAttendance();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <Calendar size={18} className="text-teal-600" />
            <span className="font-medium text-sm">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Track:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800"
            >
              <option value="all">All Tracks</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name || b.track}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {selectedBatch !== "all" && records.length === 0 && (
            <button
              onClick={handleLoadStudentsForMarking}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <Users size={16} />
              <span>Load Students</span>
            </button>
          )}

          {records.some((r) => r.isNew) && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              <span>Save Attendance</span>
            </button>
          )}
        </div>
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
