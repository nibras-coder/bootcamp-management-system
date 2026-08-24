import React, { useEffect, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import api from "../api/axios";

function Grading() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/submissions/pending");

      console.log("Pending submissions:", response.data);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Grading
        </h1>

        <p className="text-gray-500 mt-2">
          Review and grade student submissions.
        </p>

        {/* Loading */}
        {loading && (
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500">
              Loading submissions...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchPendingSubmissions}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No submissions */}
        {!loading && !error && submissions.length === 0 && (
          <div className="mt-6 bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              No pending submissions
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no student submissions waiting for grading.
            </p>
          </div>
        )}

        {/* Submissions */}
        {!loading && !error && submissions.length > 0 && (
          <div className="mt-6 space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {submission.student?.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {submission.student?.email}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                    {submission.status}
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="font-semibold text-gray-800">
                    {submission.assignment?.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">
                        Maximum Score:
                      </span>

                      <span className="ml-2 font-medium text-gray-800">
                        {submission.assignment?.maxScore}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Submitted:
                      </span>

                      <span className="ml-2 font-medium text-gray-800">
                        {submission.submittedAt
                          ? new Date(
                              submission.submittedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {submission.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      Student Notes
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {submission.notes}
                    </p>
                  </div>
                )}

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
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                    onClick={() =>
                      alert(
                        `Grading ${submission.student?.name}'s submission`
                      )
                    }
                  >
                    Grade Submission
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Grading;