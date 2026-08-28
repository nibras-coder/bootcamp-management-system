import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Check,
  ArrowLeft,
  Sparkles,
  Layers,
  Calendar,
  XCircle,
  ExternalLink,
  Plus,
  UploadCloud,
  Paperclip,
  Trash2,
  FileCheck,
  Loader2,
  Lock,
} from "lucide-react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { useNavigate, useLocation } from "react-router-dom";

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const ApplyPage = ({ defaultView }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [batches, setBatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationIdState] = useState(() => {
    return sessionStorage.getItem("selected_application_id") || null;
  });
  const [activeTab, setActiveTab] = useState(
    defaultView || (location.pathname.includes("applications") ? "my-applications" : "all")
  );
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  // Refs to always have the latest values inside async callbacks (avoids stale closure)
  const selectedApplicationIdRef = useRef(selectedApplicationId);
  const applicationsRef = useRef([]);

  const setSelectedApplicationId = (id) => {
    if (id) {
      sessionStorage.setItem("selected_application_id", id);
    } else {
      sessionStorage.removeItem("selected_application_id");
    }
    selectedApplicationIdRef.current = id;
    setSelectedApplicationIdState(id);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
      
  // Keep refs in sync with state for use in async callbacks
  useEffect(() => {
    selectedApplicationIdRef.current = selectedApplicationId;
  }, [selectedApplicationId]);

  useEffect(() => {
    applicationsRef.current = applications;
  }, [applications]);

  useEffect(() => {
    if (selectedApplicationId) {
      try {
        const saved = sessionStorage.getItem(`apply_form_${selectedApplicationId}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        }
      } catch (e) {}
    } else {
      setFormData({});
    }
  }, [selectedApplicationId]);

  useEffect(() => {
    if (location.pathname.includes("applications")) {
      setActiveTab("my-applications");
    } else if (location.pathname === "/apply" || location.pathname.includes("/apply")) {
      if (!selectedApplicationId) {
        setActiveTab("tracks");
      }
    }
  }, [location.pathname]);

  const fetchInitialData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Run both requests in parallel to cut load time in half
      const [appRes, batchRes] = await Promise.all([
        API.get("/applications/my-applications"),
        API.get("/batches"),
      ]);

      const userApps = appRes.data?.data || [];
      setApplications(userApps);

      if (batchRes.data.success) {
        setBatches(batchRes.data.data.filter((b) => b.isActive));
      }

      if (userApps.length > 0) {
        const savedAppId = sessionStorage.getItem("selected_application_id");
        if (savedAppId && userApps.some((a) => a._id === savedAppId)) {
          setSelectedApplicationIdState(savedAppId);
        } else if (userApps.length === 1 && location.pathname.includes("applications")) {
          setSelectedApplicationId(userApps[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch apply data:", error);
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
      setFetchError(
        isTimeout
          ? "The server is taking too long to respond. Please check your connection and try again."
          : error.response?.data?.message || "Failed to load your data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (batchId) => {
    // Check if registration is closed for this batch
    const batch = batches.find(b => b._id === batchId);
    if (batch?.closeRegistration) {
      toast.error("Registration for this track is currently closed. Please apply for another track.");
      return;
    }

    try {
      const response = await API.post("/applications/apply", { batchId });
      if (response.data.success) {
        toast.success("Application started successfully!");
        const newApp = response.data.data;
        const updatedApps = [newApp, ...applications.filter((a) => a._id !== newApp._id)];
        setApplications(updatedApps);
        setSelectedApplicationId(newApp._id);
        setActiveTab("my-applications");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  const handleDeleteBatch = async (batchId, e) => {
    e.stopPropagation();
    const ok = await confirm?.({
      title: "Delete Track",
      message: "Are you sure you want to delete this track? This action cannot be undone.",
      confirmText: "Yes, Delete",
      type: "danger",
    });
    
    if (ok) {
      try {
        await API.delete(`/batches/${batchId}`);
        setBatches(batches.filter(b => b._id !== batchId));
        toast.success("Track deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete track");
      }
    }
  };

  const isUserAdmin = currentUser?.role === "admin";

  const getFieldValue = (data, name) => {
    if (!data || !name) return "";
    if (data[name] !== undefined && data[name] !== null) return data[name];
    const trimmed = String(name).trim();
    if (data[trimmed] !== undefined && data[trimmed] !== null) return data[trimmed];
    const match = Object.keys(data).find(
      (k) => k.trim().toLowerCase() === trimmed.toLowerCase()
    );
    return match && data[match] !== undefined && data[match] !== null ? data[match] : "";
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [key]: value,
        [String(key).trim()]: value,
      };
      if (selectedApplicationId) {
        try {
          sessionStorage.setItem(`apply_form_${selectedApplicationId}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    setUploadingField(fieldName);
    setUploadErrors((prev) => ({ ...prev, [fieldName]: null }));
    
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await API.post("/applications/upload", uploadData);
      
      if (res.data?.success && res.data?.data?.url) {
        const fileUrl = res.data.data.url;
        const filename = res.data.data.filename || file.name;
        const sizeStr = (file.size / 1024).toFixed(1) + " KB";
        const trimmedField = String(fieldName).trim();

        // Resolve the current appId using the ref (avoids stale closure)
        const appId =
          selectedApplicationIdRef.current ||
          sessionStorage.getItem("selected_application_id") ||
          applicationsRef.current?.[0]?._id ||
          null;

        setFormData((prev) => {
          const updated = {
            ...prev,
            [fieldName]: fileUrl,
            [trimmedField]: fileUrl,
            [`${fieldName}_filename`]: filename,
            [`${trimmedField}_filename`]: filename,
            [`${fieldName}_size`]: sizeStr,
            [`${trimmedField}_size`]: sizeStr,
          };
          if (appId) {
            try {
              sessionStorage.setItem(`apply_form_${appId}`, JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });

        toast.success(`${filename} uploaded successfully!`);
      } else {
        const msg = res.data?.message || "Upload failed: unexpected server response";
        setUploadErrors((prev) => ({ ...prev, [fieldName]: msg }));
        toast.error(msg);
      }
    } catch (err) {
      console.error("File upload error details:", err);
      let errorMsg = "Failed to upload file.";
      if (err.response) {
        errorMsg = `Server Error (${err.response.status}): ${err.response.data?.message || err.response.statusText || "Request failed"}`;
      } else if (err.request) {
        errorMsg = "Network Error: Could not connect to the backend server (port 5000). Please ensure server is running.";
      } else {
        errorMsg = `Upload error: ${err.message}`;
      }
      setUploadErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmitPhase = async (e, currentPhaseConfig, currentApp) => {
    e.preventDefault();
    if (!currentApp || !currentPhaseConfig) return;

    // Validate all required fields in JavaScript
    for (const field of currentPhaseConfig.fields || []) {
      if (field.required) {
        const val = getFieldValue(formData, field.name);
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (typeof val === "string" && !val.trim())
        ) {
          toast.error(
            field.type === "file"
              ? `Please upload a file for "${field.name}"`
              : `Please provide a value for "${field.name}"`
          );
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const response = await API.post(
        `/applications/${currentApp._id}/submit`,
        {
          phaseId: currentPhaseConfig._id,
          data: formData,
        },
      );
      if (response.data.success) {
        toast.success("Phase submitted successfully!");
        const updated = response.data.data;
        setApplications((prev) =>
          prev.map((app) => (app._id === updated._id ? updated : app))
        );
        sessionStorage.removeItem(`apply_form_${currentApp._id}`);
        setFormData({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit phase");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
            <CheckCircle2 size={13} /> Enrolled / Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle size={13} /> Rejected
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
            <Clock size={13} /> Pending Initial Approval
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Sparkles size={13} /> In Progress
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your applications...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Failed to Load</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{fetchError}</p>
        </div>
        <button
          onClick={fetchInitialData}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const selectedApp = applications.find((a) => a._id === selectedApplicationId);

  // ─────────────────────────────────────────────────────────────
  // VIEW: SINGLE APPLICATION DETAILED PHASE STEPPER & SUBMISSION
  // ─────────────────────────────────────────────────────────────
  if (selectedApp) {
    const batchData =
      batches.find(
        (b) => b._id === selectedApp.batch?._id || b._id === selectedApp.batch,
      ) || selectedApp.batch;

    const phases = (batchData?.phases || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .filter((p) => p.isActive);

    const currentPhaseOrder = selectedApp.currentPhaseOrder || 1;
    const currentPhaseConfig = phases.find((p) => p.order === currentPhaseOrder);

    const existingSubmission = selectedApp.submissions?.find(
      (s) => s.phaseId === currentPhaseConfig?._id || String(s.phaseId) === String(currentPhaseConfig?._id),
    );
    const isPendingReview = existingSubmission && existingSubmission.status === "PENDING_REVIEW";
    const isRejected = selectedApp.status === "REJECTED";
    const isAccepted = selectedApp.status === "ACCEPTED";

    return (
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSelectedApplicationId(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back to All Applications
          </button>

          <div className="flex items-center gap-3">
            {getStatusBadge(selectedApp.status)}
            <button
              onClick={() => {
                setSelectedApplicationId(null);
                setActiveTab("tracks");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Plus size={14} /> Apply to Another Track
            </button>
          </div>
        </div>

        {/* Application Card Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Application Detail
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {batchData?.name || selectedApp.track || "Bootcamp Track"}
              </h1>
              {batchData?.track && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track: {batchData.track} • Applied on:{" "}
                  {new Date(selectedApp.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {isAccepted && (
              <button
                onClick={() => navigate("/student-dashboard")}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Rejection / Acceptance Banners */}
        {isRejected && (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-base">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
              Application Not Selected
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              Thank you for applying. Unfortunately, your application for this specific track was not approved.
              You are welcome to browse and apply for our other open bootcamp tracks.
            </p>
            <button
              onClick={() => {
                setSelectedApplicationId(null);
                setActiveTab("tracks");
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Browse Other Tracks <ChevronRight size={14} />
            </button>
          </div>
        )}

        {isAccepted && (
          <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-base">
              <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
              Congratulations! You are officially enrolled.
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              You have successfully completed all admission phases for {batchData?.name}. All features
              (Attendance, Assignments, Progress, Communities) are now unlocked in your Student Dashboard.
            </p>
          </div>
        )}

        {/* Phases Stepper Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-teal-600" />
              Admission Phases Progress
            </h3>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {phases.length} Phase{phases.length !== 1 ? "s" : ""} Total
            </span>
          </div>

          {phases.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-4 text-center">
              No specific phases configured for this batch yet. Admin will review your initial application.
            </p>
          ) : (
            <div className="space-y-4">
              {phases.map((phase, idx) => {
                const isPast = phase.order < currentPhaseOrder || isAccepted;
                const isCurrent = phase.order === currentPhaseOrder && !isAccepted && !isRejected;
                const isFuture = phase.order > currentPhaseOrder && !isAccepted;

                const sub = selectedApp.submissions?.find(
                  (s) => s.phaseId === phase._id || String(s.phaseId) === String(phase._id)
                );

                return (
                  <div
                    key={phase._id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? "border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm"
                        : isPast
                        ? "border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 shrink-0">
                        {isPast ? (
                          <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-xs">
                            <Check size={16} />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow">
                            {phase.order}
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-bold text-xs">
                            {phase.order}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">
                            {phase.name}
                          </h4>
                          {isPast && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                              Completed / Approved
                            </span>
                          )}
                          {isCurrent && sub?.status === "PENDING_REVIEW" && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">
                              Submitted • Under Review
                            </span>
                          )}
                          {isCurrent && !sub && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 animate-pulse">
                              Action Required
                            </span>
                          )}
                        </div>

                        {phase.shortMessage && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {phase.shortMessage}
                          </p>
                        )}

                        {phase.deadline && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} /> Deadline:{" "}
                            {new Date(phase.deadline).toLocaleDateString()}
                          </p>
                        )}

                        {sub?.reviewNotes && (
                          <div className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            <strong>Reviewer Feedback:</strong> {sub.reviewNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Active Phase Action Box */}
        {currentPhaseConfig && !isAccepted && !isRejected && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-teal-500/50 p-6 space-y-5">
            <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Current Active Phase • Phase {currentPhaseConfig.order}
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {currentPhaseConfig.name}
              </h3>
              {currentPhaseConfig.longMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700">
                  {currentPhaseConfig.longMessage}
                </p>
              )}
            </div>

            {isPendingReview ? (
              <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50 text-center space-y-2">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto" />
                <h4 className="font-bold text-gray-900 dark:text-white">Submission Under Review</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  You have submitted your requirements for this phase. The bootcamp administration is reviewing your submission. You will be notified as soon as it is evaluated.
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmitPhase(e, currentPhaseConfig, selectedApp)} noValidate className="space-y-4">
                {currentPhaseConfig.fields?.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No upload fields are required for this phase. Click below to acknowledge and submit.
                  </p>
                ) : (
                  currentPhaseConfig.fields?.map((field, fIdx) => {
                    const fieldVal = getFieldValue(formData, field.name);
                    const fieldFilename = getFieldValue(formData, `${field.name}_filename`);
                    const fieldSize = getFieldValue(formData, `${field.name}_size`);
                    const fieldError = uploadErrors[field.name] || uploadErrors[String(field.name).trim()];

                    return (
                      <div key={fIdx} className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {field.name}{" "}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === "long_text" ? (
                          <textarea
                            value={fieldVal || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={`Enter ${field.name.toLowerCase()}...`}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 text-sm"
                          />
                        ) : field.type === "checkbox" ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!fieldVal}
                              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                              className="w-4 h-4 text-teal-600 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">I confirm</span>
                          </label>
                        ) : field.type === "file" ? (
                          <div className="space-y-2">
                            {fieldVal ? (
                              <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border-2 border-teal-500/40 dark:border-teal-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-sm">
                                    <FileCheck size={20} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-teal-950 dark:text-teal-200 truncate">
                                        {fieldFilename || "Uploaded Document"}
                                      </p>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-200/70 dark:bg-teal-800 text-teal-800 dark:text-teal-200">
                                        Ready
                                      </span>
                                    </div>
                                    <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                                      {fieldSize || "File uploaded"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  <a
                                    href={
                                      fieldVal.startsWith("http")
                                        ? fieldVal
                                        : `${SERVER_URL}${fieldVal.startsWith("/") ? fieldVal : `/${fieldVal}`}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-white dark:bg-gray-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-lg transition-colors border border-teal-200 dark:border-teal-700 shadow-sm"
                                    title="View file in new tab"
                                  >
                                    <ExternalLink size={13} />
                                    Preview
                                  </a>
                                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer">
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          handleFileUpload(field.name, e.target.files[0]);
                                        }
                                      }}
                                      disabled={uploadingField === field.name}
                                    />
                                    Replace
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleFieldChange(field.name, "");
                                      handleFieldChange(`${field.name}_filename`, "");
                                      handleFieldChange(`${field.name}_size`, "");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors border border-red-200 dark:border-red-800/60 shadow-sm"
                                    title="Remove file"
                                  >
                                    <Trash2 size={13} />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-xl p-6 text-center transition-colors bg-gray-50/50 dark:bg-gray-900/30">
                                <input
                                  type="file"
                                  id={`file-${fIdx}`}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleFileUpload(field.name, e.target.files[0]);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  disabled={uploadingField === field.name}
                                />
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                  {uploadingField === field.name ? (
                                    <>
                                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-2" />
                                      <p className="text-sm font-semibold text-teal-600">
                                        Uploading document...
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <UploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <span className="text-teal-600 dark:text-teal-400 font-bold">Click to upload</span> or drag and drop
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        PDF, Word, Images, ZIP up to 10MB
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {fieldError && (
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs">
                                <AlertTriangle size={15} className="shrink-0 text-red-500" />
                                <p className="flex-1 font-medium">{fieldError}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type={field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "phone" ? "tel" : "text"}
                            value={fieldVal || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.type === "url" ? "https://..." : `Enter ${field.name.toLowerCase()}`}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 text-sm"
                          />
                        )}
                      </div>
                    );
                  })
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "Submitting Phase..." : "Submit Requirements for Phase"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN VIEW: TABS FOR ALL MY APPLICATIONS & BROWSE OPEN TRACKS
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Admissions & Track Applications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your multi-track applications, view phase statuses, and apply to available bootcamp batches.
          </p>
        </div>

        <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("my-applications")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === "my-applications"
                ? "bg-teal-600 text-white shadow"
                : "text-gray-700 dark:text-gray-300 hover:text-teal-600"
            }`}
          >
            My Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("tracks")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === "tracks"
                ? "bg-teal-600 text-white shadow"
                : "text-gray-700 dark:text-gray-300 hover:text-teal-600"
            }`}
          >
            Browse Open Tracks ({batches.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: MY APPLICATIONS LIST ── */}
      {activeTab === "my-applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 space-y-4">
              <Sparkles className="w-12 h-12 text-teal-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Applications Yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                You haven't submitted any track applications yet. Explore our open bootcamp tracks to start your journey!
              </p>
              <button
                onClick={() => setActiveTab("tracks")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
              >
                Browse Open Tracks <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {applications.map((app) => {
                const batchInfo =
                  batches.find(
                    (b) => b._id === app.batch?._id || b._id === app.batch
                  ) || app.batch;

                const phasesCount = batchInfo?.phases?.filter((p) => p.isActive)?.length || 0;
                const currentPhaseOrder = app.currentPhaseOrder || 1;

                return (
                  <div
                    key={app._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {batchInfo?.name || app.track || "Bootcamp Track"}
                          </h3>
                          {batchInfo?.track && (
                            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                              Track: {batchInfo.track}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Calendar size={13} /> Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                        {phasesCount > 0 && (
                          <p className="flex items-center gap-1.5">
                            <Layers size={13} /> Current Phase: Phase {currentPhaseOrder} of {phasesCount}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedApplicationId(app._id)}
                        className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText size={15} /> Track Application Process <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: BROWSE OPEN TRACKS & APPLY ── */}
      {activeTab === "tracks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Available Bootcamp Tracks
            </h2>
            <span className="text-xs text-gray-500">
              {batches.length} Open for registration
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {batches.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                No active tracks open for application right now. Check back soon!
              </div>
            ) : (
              batches.map((batch) => {
                const existingApp = applications.find(
                  (a) => a.batch?._id === batch._id || a.batch === batch._id
                );

                return (
                  <div
                    key={batch._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    {batch.closeRegistration && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 -mr-8 -mt-8 rotate-45 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-red-500 opacity-50" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {batch.name}
                        </h3>
                        {batch.closeRegistration && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                            <Lock className="w-3 h-3 mr-1" /> Closed
                          </span>
                        )}
                        {existingApp && getStatusBadge(existingApp.status)}
                      </div>

                      {batch.track && (
                        <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm">
                          Track: {batch.track}
                        </p>
                      )}

                      <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock size={13} />
                          <span>
                            Starts: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "TBA"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers size={13} />
                          <span>
                            {batch.phases?.length || 0} Admission Phase(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-gray-100 dark:border-gray-700">
                      {existingApp ? (
                        <button
                          onClick={() => {
                            setSelectedApplicationId(existingApp._id);
                            setActiveTab("my-applications");
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 transition-colors"
                        >
                          <FileText size={15} /> View Application Status <ChevronRight size={14} />
                        </button>
                      ) : batch.closeRegistration ? (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                          <Lock className="w-4 h-4" /> Registration Closed
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(batch._id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
                        >
                          Apply for Track <ChevronRight size={14} />
                        </button>
                      )}
                      
                      {/* Admin Delete Button */}
                      {isUserAdmin && (
                        <button
                          onClick={(e) => handleDeleteBatch(batch._id, e)}
                          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/30 transition-colors"
                        >
                          <Trash2 size={14} /> Delete Track
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyPage;
