import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import {
  TrendingUp,
  Save,
  Loader2,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Menu,
} from "lucide-react";

const statusStyles = {
  "Not Started":
    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700",
  "In Progress":
    "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-semibold border border-orange-200 dark:border-orange-800",
  Completed:
    "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800",
  "Need Help":
    "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-semibold border border-red-200 dark:border-red-800",
  "Needs Improvement":
    "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-semibold border border-red-200 dark:border-red-800",
};

const statusIcons = {
  "Not Started": Clock,
  "In Progress": TrendingUp,
  Completed: CheckCircle,
  "Need Help": AlertTriangle,
  "Needs Improvement": AlertTriangle,
};

function Progress() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [topicsList, setTopicsList] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingTopics, setFetchingTopics] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await API.get("/mentor/students");
        if (res.data.success && res.data.data.length > 0) {
          const list = res.data.data;
          setStudents(list);
          setSelectedStudent(list[0]);
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch student progress dynamically when selected student changes
  useEffect(() => {
    if (!selectedStudent) return;
    const fetchStudentProgress = async () => {
      setFetchingTopics(true);
      try {
        const res = await API.get(`/progress/student/${selectedStudent._id}`);
        if (res.data.success && res.data.data) {
          const fetched = res.data.data;
          const items = Array.isArray(fetched.progress)
            ? fetched.progress
            : Array.isArray(fetched)
              ? fetched
              : [];
          setTopicsList(items);

          // Get latest note if any
          const firstNote = items.find((item) => item.notes)?.notes || "";
          setNote(firstNote);
        }
      } catch (err) {
        console.error("Failed to load student topics:", err);
      } finally {
        setFetchingTopics(false);
      }
    };
    fetchStudentProgress();
  }, [selectedStudent]);

  const handleSaveFeedback = async () => {
    if (!selectedStudent) return;
    if (!note.trim()) {
      toast.warning("Please enter feedback notes for the student");
      return;
    }
    setSaving(true);
    try {
      const batchId = selectedStudent.batch?._id || selectedStudent.batch;
      for (const item of topicsList) {
        const topic = item.topic || item.title;
        const status = item.status || "Not Started";
        await API.post("/progress", {
          student: selectedStudent._id,
          batch: batchId,
          topic,
          status,
          week: item.week || 1,
          notes: note,
        });
      }
      toast.success(`Feedback saved for ${selectedStudent.name}!`);
    } catch (err) {
      toast.error("Failed to save feedback");
    } finally {
      setSaving(false);
    }
  };

  const totalCount = topicsList.length;
  const completedCount = topicsList.filter(
    (t) => t.status === "Completed",
  ).length;
  const inProgressCount = topicsList.filter(
    (t) => t.status === "In Progress",
  ).length;
  const needHelpCount = topicsList.filter(
    (t) => t.status === "Need Help" || t.status === "Needs Improvement",
  ).length;
  const notStartedCount = topicsList.filter(
    (t) => !t.status || t.status === "Not Started",
  ).length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 min-h-screen overflow-y-auto">
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
            <span className="font-bold text-sm">Student Progress</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <TrendingUp
                className="text-teal-600 dark:text-teal-400"
                size={26}
              />
              Student Progress & Feedback
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Review self-reported learning progress from your students and
              provide coaching notes.
            </p>
          </div>
        </div>

        {/* Student Selector Carousel/Pills */}
        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <Loader2
              className="animate-spin mx-auto mb-2 text-teal-600"
              size={28}
            />
            <p className="text-sm">Loading students roster...</p>
          </div>
        ) : students.length > 0 ? (
          <div>
            <div className="mb-6 max-w-sm">
              <label
                htmlFor="studentSelect"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select Student
              </label>
              <select
                id="studentSelect"
                value={selectedStudent?._id || ""}
                onChange={(e) => {
                  const student = students.find(
                    (s) => s._id === e.target.value,
                  );
                  setSelectedStudent(student);
                }}
                className="block w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2.5 border"
              >
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="space-y-6">
                {/* Stats Summary for this student */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 font-medium">
                      Overall Mastery
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <strong className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {progressPct}%
                      </strong>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold">
                        {completedCount}/{totalCount} Modules
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 font-medium">
                      In Progress
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <strong className="text-2xl font-bold text-orange-500">
                        {inProgressCount}
                      </strong>
                      <span className="text-xs text-gray-400">
                        active modules
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 font-medium">
                      Student Needs Help
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <strong className="text-2xl font-bold text-red-500">
                        {needHelpCount}
                      </strong>
                      <span className="text-xs text-red-500 font-semibold">
                        {needHelpCount > 0 ? "Requires Attention" : "All Good"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 font-medium">
                      Not Started
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                      <strong className="text-2xl font-bold text-gray-500">
                        {notStartedCount}
                      </strong>
                      <span className="text-xs text-gray-400">upcoming</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Dynamic Learning Resources / Topics */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-750">
                      <div>
                        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                          {selectedStudent.name}'s Learning Modules
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Self-reported status from {selectedStudent.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          {progressPct}%
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Completed
                        </span>
                      </div>
                    </div>

                    {fetchingTopics ? (
                      <div className="py-12 text-center text-gray-400 text-xs">
                        <Loader2
                          className="animate-spin mx-auto mb-2 text-teal-600"
                          size={24}
                        />
                        <p>Loading curriculum topics...</p>
                      </div>
                    ) : topicsList.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {topicsList.map((item) => {
                          const topicTitle = item.topic || item.title;
                          const currentStatus = item.status || "Not Started";
                          const StatusIcon =
                            statusIcons[currentStatus] || Clock;

                          return (
                            <div
                              key={topicTitle}
                              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                                  <BookOpen size={15} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {topicTitle}
                                  </h4>
                                  <span className="text-xs text-gray-400">
                                    Week {item.week || 1} Curriculum ·{" "}
                                    {item.target || "All Tracks"}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  statusStyles[currentStatus] ||
                                  statusStyles["Not Started"]
                                }`}
                              >
                                <StatusIcon size={13} />
                                <span>{currentStatus}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-400 text-xs p-6">
                        <BookOpen
                          size={28}
                          className="mx-auto mb-2 text-gray-500"
                        />
                        <p className="font-semibold text-gray-300">
                          No learning resources published yet
                        </p>
                        <p className="mt-1">
                          Add resources in the Resources tab to track student
                          progress.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mentor Notes & Feedback Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                        <MessageSquare size={18} />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          Mentor Feedback & Notes
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Leave coaching remarks or focus areas for{" "}
                        <strong>{selectedStudent.name}</strong>. The student can
                        read your notes on their dashboard.
                      </p>
                      <textarea
                        rows={8}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Great progress! Focus next on practicing..."
                        className="w-full text-sm p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveFeedback}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>Save Mentor Notes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            No students found in your mentorship tracks.
          </div>
        )}
      </main>
    </div>
  );
}

export default Progress;
