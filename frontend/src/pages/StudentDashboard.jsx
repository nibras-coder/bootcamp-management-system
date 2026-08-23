import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Menu,
  X,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [submitModalData, setSubmitModalData] = useState(null);
  const [feedbackModalData, setFeedbackModalData] = useState(null);
  const [submitUrl, setSubmitUrl] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "Student";

  // Mock Data
  const progressScore = 85;
  const attendanceHistory = "24/30 Days Attended";
  const assignments = [
    {
      _id: "1",
      title: "React Component Library",
      deadline: "2026-08-25",
      maxScore: 100,
      status: "Pending",
    },
    {
      _id: "2",
      title: "Express REST API",
      deadline: "2026-08-30",
      maxScore: 100,
      status: "Graded",
      score: 95,
      feedback:
        "Excellent work! Great folder structure and proper error handling middleware.",
    },
    {
      _id: "3",
      title: "MongoDB Schema Design",
      deadline: "2026-09-05",
      maxScore: 100,
      status: "Pending",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "attendance", label: "My Attendance", icon: Calendar },
  ];

  // --- Sub-Components --- //

  const SubmitModal = () => {
    if (!submitModalData) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Submit Assignment
            </h3>
            <button
              onClick={() => setSubmitModalData(null)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Submitting work for:{" "}
            <span className="font-bold text-gray-900">
              {submitModalData.title}
            </span>
          </p>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project / GitHub URL
            </label>
            <input
              type="url"
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                alert(`Successfully submitted ${submitUrl}!`);
                setSubmitUrl("");
                setSubmitModalData(null);
              }}
              className="flex-1 bg-teal-800 hover:bg-teal-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Submit Work
            </button>
            <button
              onClick={() => setSubmitModalData(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FeedbackModal = () => {
    if (!feedbackModalData) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <CheckCircle className="text-teal-600" size={20} /> Graded
            </h3>
            <button
              onClick={() => setFeedbackModalData(null)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {feedbackModalData.title}
          </h4>

          <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
              Final Score
            </p>
            <p className="text-4xl font-black text-teal-700">
              {feedbackModalData.score}{" "}
              <span className="text-xl text-gray-400">
                / {feedbackModalData.maxScore}
              </span>
            </p>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              Mentor Comments
            </p>
            <p className="text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-100 italic">
              "{feedbackModalData.feedback}"
            </p>
          </div>

          <button
            onClick={() => setFeedbackModalData(null)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // --- Views --- //

  const OverviewView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Your Progress
          </h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Completion
            </span>
            <span className="text-2xl font-bold text-teal-700">
              {progressScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressScore}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            My Attendance
          </h2>
          <p className="text-sm font-medium text-gray-500 mb-4">
            Overall History
          </p>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
              <CheckCircle size={28} />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {attendanceHistory}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assignments Preview */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Assignments
          </h2>
          <button
            onClick={() => setActiveTab("assignments")}
            className="text-sm font-medium text-teal-600 hover:text-teal-800 transition flex items-center gap-1"
          >
            View All <ExternalLink size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.slice(0, 3).map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md mb-4 inline-block ${
                    assignment.status === "Graded"
                      ? "bg-teal-50 text-teal-700"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {assignment.status}
                </span>
                <h3 className="font-bold text-gray-900 mb-1">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Due: {new Date(assignment.deadline).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() =>
                  assignment.status === "Graded"
                    ? setFeedbackModalData(assignment)
                    : setSubmitModalData(assignment)
                }
                className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                  assignment.status === "Graded"
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    : "bg-teal-800 hover:bg-teal-900 text-white"
                }`}
              >
                {assignment.status === "Graded"
                  ? "View Feedback"
                  : "Submit Work"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AssignmentsView = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Assignments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    assignment.status === "Graded"
                      ? "bg-teal-50 text-teal-700"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {assignment.status}
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  Max: {assignment.maxScore}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">
                {assignment.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
                <Calendar size={14} />{" "}
                {new Date(assignment.deadline).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() =>
                assignment.status === "Graded"
                  ? setFeedbackModalData(assignment)
                  : setSubmitModalData(assignment)
              }
              className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                assignment.status === "Graded"
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  : "bg-teal-800 hover:bg-teal-900 text-white"
              }`}
            >
              {assignment.status === "Graded" ? "View Feedback" : "Submit Work"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const AttendanceView = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Attendance History
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center max-w-3xl mx-auto">
        <div className="inline-block p-4 bg-teal-50 rounded-full mb-4 text-teal-600">
          <Calendar size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          You've attended 24 out of 30 days.
        </h3>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Your overall attendance rate is 80%. Keep showing up to ensure you
          don't fall behind on the coursework!
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden max-w-md mx-auto">
          <div className="bg-teal-600 h-full rounded-full w-4/5"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Header Menu Toggle */}
      <div className="md:hidden absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-40 bg-teal-900 text-white shadow-md">
        <h1 className="text-lg font-bold tracking-tight">ASTU MSJ Bootcamp</h1>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-teal-800 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Solid Sidebar matching Admin/Mentor */}
      <aside
        className={`
        fixed md:relative z-50 w-64 h-full flex flex-col justify-between transition-transform duration-300
        bg-teal-900 text-white shadow-xl
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div>
          <div className="p-6 border-b border-teal-800 flex items-center justify-between md:justify-start gap-3">
            <div>
              <h1 className="font-bold text-lg leading-tight">ASTU MSJ</h1>
              <p className="text-xs text-teal-300">Bootcamp System</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-teal-200 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? "bg-teal-800 text-white font-semibold border-l-4 border-white"
                      : "text-teal-100 hover:bg-teal-800/50"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={isActive ? "text-white" : "text-teal-300"}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-teal-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 text-red-500 text-sm font-medium hover:bg-teal-800/50 rounded transition-colors mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
          <div className="flex items-center gap-3 mt-2 px-2">
            <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              <p className="text-xs text-teal-300">Student</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-6xl mx-auto pb-10">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Welcome back, {name}. Here is your current progress.
            </p>
          </header>

          {/* Dynamic Views */}
          {activeTab === "overview" && <OverviewView />}
          {activeTab === "assignments" && <AssignmentsView />}
          {activeTab === "attendance" && <AttendanceView />}
        </div>
      </main>

      {/* Render Modals */}
      <SubmitModal />
      <FeedbackModal />
    </div>
  );
}
