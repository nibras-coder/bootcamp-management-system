import React, { useEffect, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import api from "../api/axios";

function Grading() {
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // FETCH SUBMISSIONS
  // =====================================================

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      // Get ALL submissions from mentor's batches
      const response = await api.get("/submissions");

      console.log("Submissions response:", response.data);

      setSubmissions(response.data.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load student submissions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OPEN GRADING FORM
  // =====================================================

  const openGrading = (submission) => {
    setSelectedSubmission(submission);

    setScore(
      submission.score !== null &&
        submission.score !== undefined
        ? submission.score
        : ""
    );

    setFeedback(submission.feedback || "");

    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // CLOSE GRADING FORM
  // =====================================================

  const closeGrading = () => {
    if (saving) return;

    setSelectedSubmission(null);
    setScore("");
    setFeedback("");
  };

  // =====================================================
  // SAVE GRADE
  // =====================================================

  const handleGrade = async (e) => {
    e.preventDefault();

    if (!selectedSubmission) return;

    const maxScore =
      selectedSubmission.assignment?.maxScore || 0;

    if (score === "") {
      setMessage("Please enter a score.");
      setMessageType("error");
      return;
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      setMessage("Score must be a valid number.");
      setMessageType("error");
      return;
    }

    if (numericScore < 0) {
      setMessage("Score cannot be less than 0.");
      setMessageType("error");
      return;
    }

    if (numericScore > maxScore) {
      setMessage(
        `Score cannot be greater than ${maxScore}.`
      );
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await api.put(
        `/submissions/${selectedSubmission._id}/grade`,
        {
          score: numericScore,
          feedback: feedback.trim(),
          status: "Graded",
        }
      );

      console.log("Grade response:", response.data);

      setMessage(
        "Submission graded successfully!"
      );
      setMessageType("success");

      // Refresh submissions
      await fetchSubmissions();

      // Close after short delay
      setTimeout(() => {
        setSelectedSubmission(null);
        setScore("");
        setFeedback("");
        setMessage("");
      }, 1000);
    } catch (err) {
      console.error("Grade submission error:", err);

      setMessage(
        err.response?.data?.message ||
          "Failed to grade submission."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // REQUEST RESUBMISSION
  // =====================================================

  const handleResubmission = async () => {
    if (!selectedSubmission) return;

    if (!feedback.trim()) {
      setMessage(
        "Please provide feedback explaining what the student needs to improve."
      );
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await api.put(
        `/submissions/${selectedSubmission._id}/resubmit`,
        {
          feedback: feedback.trim(),
        }
      );

      console.log(
        "Resubmission response:",
        response.data
      );

      setMessage(
        "Resubmission requested successfully!"
      );

      setMessageType("success");

      await fetchSubmissions();

      setTimeout(() => {
        setSelectedSubmission(null);
        setScore("");
        setFeedback("");
        setMessage("");
      }, 1000);
    } catch (err) {
      console.error(
        "Request resubmission error:",
        err
      );

      setMessage(
        err.response?.data?.message ||
          "Failed to request resubmission."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

              <p className="text-gray-500">
                Loading submissions...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Grading
            </h1>

            <p className="text-gray-500 mt-1">
              Review student assignments and provide scores
              and feedback.
            </p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-3">
            <p className="text-xs text-gray-400">
              Total Submissions
            </p>

            <p className="text-2xl font-bold text-teal-700">
              {submissions.length}
            </p>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">
              {error}
            </p>

            <button
              onClick={fetchSubmissions}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* NO SUBMISSIONS */}

        {!error && submissions.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">

            <div className="text-5xl mb-4">
              📝
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              No submissions found
            </h2>

            <p className="text-gray-500 mt-2">
              Student submissions from your assigned batches
              will appear here.
            </p>

            <button
              onClick={fetchSubmissions}
              className="mt-5 px-5 py-2.5 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800"
            >
              Refresh
            </button>

          </div>
        )}

        {/* SUBMISSIONS */}

        {submissions.length > 0 && (
          <div className="space-y-5">

            {submissions.map((submission) => {

              const maxScore =
                submission.assignment?.maxScore || 0;

              const isGraded =
                submission.status === "Graded";

              const isResubmission =
                submission.status ===
                "Resubmission Required";

              return (
                <div
                  key={submission._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-lg">
                        {submission.student?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "S"}
                      </div>

                      <div>
                        <h2 className="font-bold text-gray-900">
                          {submission.student?.name ||
                            "Unknown Student"}
                        </h2>

                        <p className="text-sm text-gray-400">
                          {submission.student?.email}
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium w-fit ${
                        isGraded
                          ? "bg-teal-50 text-teal-700"
                          : isResubmission
                          ? "bg-red-50 text-red-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {submission.status}
                    </span>

                  </div>

                  {/* ASSIGNMENT */}

                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">

                    <h3 className="font-semibold text-gray-900">
                      {submission.assignment?.title ||
                        "Assignment"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">

                      <div>
                        <p className="text-xs text-gray-400">
                          Maximum Score
                        </p>

                        <p className="font-semibold text-gray-800">
                          {maxScore}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Submitted
                        </p>

                        <p className="font-semibold text-gray-800">
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Current Score
                        </p>

                        <p className="font-semibold text-teal-700">
                          {submission.score !== null &&
                          submission.score !== undefined
                            ? `${submission.score} / ${maxScore}`
                            : "Not graded"}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* STUDENT NOTES */}

                  {submission.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Student Notes
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {submission.notes}
                      </p>
                    </div>
                  )}

                  {/* LINKS */}

                  <div className="flex flex-wrap gap-3 mt-5">

                    {submission.githubUrl && (
                      <a
                        href={submission.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
                      >
                        View GitHub
                      </a>
                    )}

                    {submission.liveDemoUrl && (
                      <a
                        href={submission.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        View Live Demo
                      </a>
                    )}

                    <button
                      onClick={() =>
                        openGrading(submission)
                      }
                      className="px-5 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800"
                    >
                      {isGraded
                        ? "Edit Grade"
                        : "Grade Submission"}
                    </button>

                  </div>

                  {/* FEEDBACK */}

                  {submission.feedback && (
                    <div className="mt-5 border-t border-gray-100 pt-4">

                      <p className="text-sm font-semibold text-gray-700">
                        Mentor Feedback
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {submission.feedback}
                      </p>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </main>

      {/* =================================================
          GRADING MODAL
      ================================================= */}

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Grade Submission
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  {selectedSubmission.student?.name}
                </p>
              </div>

              <button
                onClick={closeGrading}
                disabled={saving}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleGrade}
              className="p-6"
            >

              {/* ASSIGNMENT */}

              <div className="bg-gray-50 rounded-xl p-4 mb-5">

                <p className="text-xs text-gray-400">
                  Assignment
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {
                    selectedSubmission.assignment
                      ?.title
                  }
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Maximum score:{" "}
                  <span className="font-semibold">
                    {
                      selectedSubmission.assignment
                        ?.maxScore
                    }
                  </span>
                </p>

              </div>

              {/* SCORE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score
                </label>

                <div className="flex items-center gap-3">

                  <input
                    type="number"
                    min="0"
                    max={
                      selectedSubmission.assignment
                        ?.maxScore || 0
                    }
                    step="0.01"
                    value={score}
                    onChange={(e) =>
                      setScore(e.target.value)
                    }
                    placeholder="Enter score"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
                  />

                  <span className="text-gray-500 font-medium whitespace-nowrap">
                    /{" "}
                    {
                      selectedSubmission.assignment
                        ?.maxScore
                    }
                  </span>

                </div>
              </div>

              {/* FEEDBACK */}

              <div className="mt-5">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>

                <textarea
                  value={feedback}
                  onChange={(e) =>
                    setFeedback(e.target.value)
                  }
                  rows={5}
                  placeholder="Write feedback for the student..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
                />

              </div>

              {/* MESSAGE */}

              {message && (
                <div
                  className={`mt-4 p-3 rounded-xl text-sm ${
                    messageType === "success"
                      ? "bg-teal-50 text-teal-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">

                <button
                  type="button"
                  onClick={handleResubmission}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 disabled:opacity-50"
                >
                  Request Resubmission
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl bg-teal-700 text-white font-medium text-sm hover:bg-teal-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Grade"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}

export default Grading;