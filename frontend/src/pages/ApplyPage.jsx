import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Check,
} from "lucide-react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const ApplyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch user's applications
      const appRes = await API.get("/applications/my-applications");
      if (appRes.data.success && appRes.data.data.length > 0) {
        setApplication(appRes.data.data[0]);
      }

      // Fetch all batches
      const batchRes = await API.get("/batches");
      if (batchRes.data.success) {
        setBatches(batchRes.data.data.filter((b) => b.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch apply data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (batchId) => {
    try {
      const response = await API.post("/applications/apply", { batchId });
      if (response.data.success) {
        toast.success("Application started successfully!");
        setApplication(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitPhase = async (e, currentPhaseConfig) => {
    e.preventDefault();
    if (!application || !currentPhaseConfig) return;

    setSubmitting(true);
    try {
      const response = await API.post(
        `/applications/${application._id}/submit`,
        {
          phaseId: currentPhaseConfig._id,
          data: formData,
        },
      );
      if (response.data.success) {
        toast.success("Phase submitted successfully!");
        setApplication(response.data.data);
        setFormData({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit phase");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading application data...</p>
      </div>
    );
  }

  // If already accepted and enrolled, maybe redirect or show a success screen
  if (application && application.status === "ACCEPTED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Congratulations!
          </h2>
          <p className="text-gray-600 mb-8">
            You have successfully passed all admission phases and are now fully
            enrolled in {application.batch?.name || "your batch"}.
          </p>
          <button
            onClick={() => navigate("/student-dashboard")}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Helper for Back to Dashboard button
  const BackToDashboard = ({ showGoBack }) => (
    <div className="mb-4 flex items-center gap-6">
      <button 
        onClick={() => navigate("/student-dashboard")}
        className="flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
      >
        <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Dashboard
      </button>
      {showGoBack && (
        <button 
          onClick={() => setApplication(null)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Go Back to Tracks
        </button>
      )}
    </div>
  );

  // If application in progress, show dynamic workflow
  if (application) {
    const currentPhaseOrder = application.currentPhaseOrder;
    // application.batch is populated in getMyApplications, but we might need its full phases
    // Actually, `Application.find().populate('batch')` only populated some fields by default or all fields.
    // Let's assume it populated everything. If not, we fall back to finding it in `batches` state.
    const batchData =
      batches.find(
        (b) => b._id === application.batch?._id || b._id === application.batch,
      ) || application.batch;

    if (!batchData || !batchData.phases) {
      return <div>Error loading batch phase configuration.</div>;
    }

    const phases = [...batchData.phases]
      .sort((a, b) => a.order - b.order)
      .filter((p) => p.isActive);
    const currentPhaseConfig = phases.find(
      (p) => p.order === currentPhaseOrder,
    );
    const existingSubmission = application.submissions?.find(
      (s) => s.phaseId === currentPhaseConfig?._id,
    );
    const isPendingReview =
      existingSubmission && existingSubmission.status === "PENDING_REVIEW";
    const isRejected = application.status === "REJECTED";

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <BackToDashboard showGoBack={true} />
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Application Progress
              </h1>
              <p className="text-gray-600 mt-2">Batch: {batchData.name}</p>
            </div>
            {isRejected && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" /> REJECTED
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Admission Phases
            </h3>
            <div className="space-y-4">
              {phases.map((phase) => {
                const isPast = phase.order < currentPhaseOrder;
                const isCurrent = phase.order === currentPhaseOrder;
                const isFuture = phase.order > currentPhaseOrder;

                return (
                  <div
                    key={phase._id}
                    className={`flex items-start p-4 rounded-xl border ${isCurrent ? "border-teal-500 bg-teal-50/30" : "border-gray-100 bg-gray-50/50"}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isPast ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h4
                        className={`font-semibold ${isPast ? "text-green-700" : isCurrent ? "text-teal-900" : "text-gray-500"}`}
                      >
                        {phase.name}
                      </h4>
                      {isCurrent && phase.shortMessage && (
                        <p className="text-sm text-gray-600 mt-1">
                          {phase.shortMessage}
                        </p>
                      )}
                    </div>
                    {isCurrent && isPendingReview && (
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        PENDING REVIEW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!isRejected && currentPhaseConfig && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-teal-50/30">
                <h3 className="text-xl font-bold text-gray-900">
                  Current Phase: {currentPhaseConfig.name}
                </h3>
                {currentPhaseConfig.longMessage && (
                  <p className="text-gray-600 mt-2 text-sm whitespace-pre-wrap">
                    {currentPhaseConfig.longMessage}
                  </p>
                )}
              </div>

              <div className="p-6">
                {isPendingReview ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Under Review
                    </h3>
                    <p className="text-gray-600">
                      You have successfully submitted your information for this
                      phase. The admission team is currently reviewing it.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => handleSubmitPhase(e, currentPhaseConfig)}
                    className="space-y-6"
                  >
                    {currentPhaseConfig.fields?.length === 0 ? (
                      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex items-start">
                        <FileText className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                        <p>
                          No specific details are required for this phase.
                          Simply acknowledge and submit to proceed.
                        </p>
                      </div>
                    ) : (
                      currentPhaseConfig.fields?.map((field, idx) => (
                        <div key={idx}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.name}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {field.type === "long_text" ? (
                            <textarea
                              required={field.required}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                handleFieldChange(field.name, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                              rows="4"
                            />
                          ) : field.type === "checkbox" ? (
                            <input
                              type="checkbox"
                              required={field.required}
                              checked={formData[field.name] || false}
                              onChange={(e) =>
                                handleFieldChange(field.name, e.target.checked)
                              }
                              className="w-5 h-5 text-teal-600 rounded"
                            />
                          ) : (
                            <input
                              type={
                                field.type === "url"
                                  ? "url"
                                  : field.type === "email"
                                    ? "email"
                                    : field.type === "number"
                                      ? "number"
                                      : "text"
                              }
                              required={field.required}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                handleFieldChange(field.name, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                          )}
                        </div>
                      ))
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Phase"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-6">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Application Rejected
              </h3>
              <p className="text-red-700">
                We regret to inform you that your application has been rejected
                at this stage. Thank you for your interest.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If no application yet, show available batches
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BackToDashboard />
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          All Tracks
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          {batches.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-12">
              No active batches open for application right now. Check back
              later!
            </div>
          ) : (
            batches.map((batch) => (
              <div
                key={batch._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {batch.name}
                </h3>
                {batch.track && (
                  <p className="text-teal-600 font-medium text-sm mb-4">
                    Track: {batch.track}
                  </p>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Starts: {new Date(batch.startDate).toLocaleDateString()}
                </div>

                <button
                  onClick={() => handleApply(batch._id)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
