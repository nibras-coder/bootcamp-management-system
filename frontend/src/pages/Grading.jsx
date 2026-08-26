import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Award, CheckCircle, Clock, RotateCcw, ExternalLink, X, Loader2, FileText , Menu } from "lucide-react";

function Grading() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await API.get("/submissions");
      if (res.data.success) {
        setSubmissions(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const openSubmission = (submission) => {
    setSelected(submission);
    setScore(submission.score ?? "");
    setFeedback(submission.feedback ?? "");
  };

  const closeModal = () => {
    setSelected(null);
    setScore("");
    setFeedback("");
  };

  const handleGrade = async (status = "Graded") => {
    if (!selected) return;
    if (status === "Graded" && (score === "" || score === null)) {
      toast.warning("Please assign a score");
      return;
    }
    setSubmitting(true);
    try {
      if (status === "Resubmission Required") {
        const res = await API.put(`/submissions/${selected._id}/resubmit`, {
          feedback: feedback || "Please revise and resubmit.",
        });
        if (res.data.success) {
          toast.success("Resubmission requested");
          closeModal();
          fetchSubmissions();
        }
      } else {
        const res = await API.put(`/submissions/${selected._id}/grade`, {
          score: Number(score),
          feedback,
          status: "Graded",
        });
        if (res.data.success) {
          toast.success("Submission graded successfully!");
          closeModal();
          fetchSubmissions();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit grading");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingList = submissions.filter((s) => s.status === "Submitted" || s.status === "Pending");
  const gradedList = submissions.filter((s) => s.status === "Graded");
  const resubmitList = submissions.filter((s) => s.status === "Resubmission Required");

  const filteredSubmissions = submissions.filter((item) => {
    if (activeTab === "pending") return item.status === "Submitted" || item.status === "Pending";
    if (activeTab === "graded") return item.status === "Graded";
    if (activeTab === "resubmit") return item.status === "Resubmission Required";
    return true;
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
            <span className="font-bold text-sm">Grading</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Award className="text-teal-600 dark:text-teal-400" size={26} />
              Assignment Grading
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Review student code submissions, assign scores, and deliver constructive feedback
            </p>
          </div>
        </div>

        {/* Filter KPI Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeTab === "pending"
                ? "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700 shadow-sm"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Needs Review</span>
              <Clock size={16} className="text-orange-500" />
            </div>
            <strong className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
              {pendingList.length}
            </strong>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("graded")}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeTab === "graded"
                ? "bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-sm"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Graded</span>
              <CheckCircle size={16} className="text-teal-500" />
            </div>
            <strong className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
              {gradedList.length}
            </strong>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`p-4 rounded-xl text-left border transition-all ${
              activeTab === "all"
                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">All Submissions</span>
              <FileText size={16} className="text-gray-400" />
            </div>
            <strong className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
              {submissions.length}
            </strong>
          </button>
        </div>

        {/* Submissions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={28} />
              <p className="text-sm">Loading student submissions...</p>
            </div>
          ) : filteredSubmissions.length ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredSubmissions.map((sub) => {
                const maxScore = sub.assignment?.maxScore || 100;
                const isGraded = sub.status === "Graded";

                return (
                  <div key={sub._id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-white text-base">
                          {sub.student?.name || "Student"}
                        </span>
                        <span className="text-xs text-gray-400">({sub.student?.email})</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          isGraded ? "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300" : "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                        }`}>
                          {sub.status || "Submitted"}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {sub.assignment?.title || "Bootcamp Assignment"}
                      </p>

                      {sub.notes && (
                        <p className="text-xs text-gray-500 italic">Student Note: "{sub.notes}"</p>
                      )}

                      <div className="flex items-center gap-3 text-xs pt-1">
                        {sub.githubUrl && (
                          <a
                            href={sub.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-medium"
                          >
                            <ExternalLink size={12} /> View Code
                          </a>
                        )}
                        {sub.liveDemoUrl && (
                          <a
                            href={sub.liveDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-medium"
                          >
                            <ExternalLink size={12} /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {isGraded && (
                        <div className="text-right">
                          <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                            {sub.score}/{maxScore}
                          </span>
                          <span className="text-xs text-gray-400 block">Graded</span>
                        </div>
                      )}

                      <button
                        onClick={() => openSubmission(sub)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isGraded
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                            : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                        }`}
                      >
                        {isGraded ? "Update Grade" : "Review & Grade"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No submissions found in this tab.
            </div>
          )}
        </div>

        {/* Grading Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Grade Submission
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selected.student?.name} — {selected.assignment?.title}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Student: {selected.student?.name}</span>
                    <span>Max Score: {selected.assignment?.maxScore || 100}</span>
                  </div>
                  {selected.githubUrl && (
                    <div className="text-xs">
                      <strong className="text-gray-600 dark:text-gray-300">GitHub: </strong>
                      <a href={selected.githubUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                        {selected.githubUrl}
                      </a>
                    </div>
                  )}
                  {selected.notes && (
                    <p className="text-xs text-gray-500 italic mt-1">Student Note: "{selected.notes}"</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Score (Out of {selected.assignment?.maxScore || 100}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selected.assignment?.maxScore || 100}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 95"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Mentor Feedback & Code Review
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback, praise good architecture, point out optimization areas..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGrade("Resubmission Required")}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold border border-red-200 dark:border-red-800"
                  >
                    <RotateCcw size={14} />
                    <span>Request Revision</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGrade("Graded")}
                      disabled={submitting}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      <span>Submit Grade</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Grading;
