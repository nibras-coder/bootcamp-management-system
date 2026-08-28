import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  ExternalLink,
  Eye,
  Paperclip,
  Calendar,
  User,
  Clock,
  Layers,
  AlertTriangle,
  Info,
} from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const ApplicationReviewModal = ({ isOpen, onClose, application, batch, existingTrackInfo, checkingOtherTrack, onReviewed }) => {
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPhaseOrder, setSelectedPhaseOrder] = useState(null);

  if (!isOpen || !application || !batch) return null;

  const currentPhaseOrder = application.currentPhaseOrder || 1;
  const activePhaseOrder = selectedPhaseOrder || currentPhaseOrder;
  const phaseConfig = batch.phases?.find((p) => p.order === activePhaseOrder) || batch.phases?.[0];
  
  // Safe comparison converting both to string
  const submission = application.submissions?.find(
    (s) => String(s.phaseId) === String(phaseConfig?._id)
  );

  const handleReview = async (status) => {
    if (!submission) {
      toast.error("No submission found for this phase.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.put(`/applications/${application._id}/review`, {
        phaseId: phaseConfig._id,
        status,
        reviewNotes,
      });
      if (response.data.success) {
        toast.success(`Application phase ${status.toLowerCase()} successfully`);
        onReviewed();
        onClose();
        setReviewNotes("");
      }
    } catch (error) {
      console.error("Review failed:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const getFullFileUrl = (val) => {
    if (!val || typeof val !== "string") return null;
    if (val.startsWith("http") || val.startsWith("data:")) return val;
    const cleanPath = val.startsWith("/") ? val : `/${val}`;
    return `${SERVER_URL}${cleanPath}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Review Application
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                  <User size={13} /> {application.student?.name || "Student"}
                </span>
                <span>•</span>
                <span>{application.student?.email}</span>
                <span>•</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  Track: {batch.track || "Bootcamp"}
                </span>
              </div>
            </div>
          </div>
          {existingTrackInfo && !checkingOtherTrack && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                Student already accepted to: {existingTrackInfo.batch?.name || existingTrackInfo.track}
              </span>
            </div>
          )}
          {checkingOtherTrack && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Checking other tracks...</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 rounded-xl transition-all text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Switcher Tabs */}
        {batch.phases?.length > 1 && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/30 overflow-x-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 shrink-0">
              Phases:
            </span>
            {batch.phases.map((p) => {
              const pSub = application.submissions?.find(
                (s) => String(s.phaseId) === String(p._id)
              );
              const isActive = (selectedPhaseOrder || currentPhaseOrder) === p.order;
              return (
                <button
                  key={p._id || p.order}
                  onClick={() => setSelectedPhaseOrder(p.order)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>Phase {p.order}: {p.name}</span>
                  {pSub && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        pSub.status === "APPROVED"
                          ? "bg-green-400"
                          : pSub.status === "REJECTED"
                          ? "bg-red-400"
                          : "bg-yellow-400"
                      }`}
                      title={`Status: ${pSub.status}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Existing Track Warning */}
          {existingTrackInfo && !checkingOtherTrack && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1">
                  ⚠️ Student Already Accepted to Another Track
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                  This student has been accepted to:{" "}
                  <strong>{existingTrackInfo.batch?.name || existingTrackInfo.track}</strong>
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  Consider this before approving for this track.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-bold px-3 py-1 rounded-full">
                  Phase {phaseConfig?.order}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {phaseConfig?.name}
                </h3>
              </div>
              {submission && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    submission.status === "APPROVED"
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : submission.status === "REJECTED"
                      ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                      : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                  }`}
                >
                  {submission.status.replace("_", " ")}
                </span>
              )}
            </div>

            {phaseConfig?.longMessage && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                {phaseConfig.longMessage}
              </p>
            )}

            {submission ? (
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span> Submitted Requirements
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {phaseConfig?.fields?.map((field, idx) => {
                    const val = submission.data ? submission.data[field.name] : null;
                    const fileUrl = getFullFileUrl(val);
                    const isFileOrUrl =
                      field.type === "file" ||
                      (typeof val === "string" && (val.startsWith("/uploads/") || val.startsWith("http://") || val.startsWith("https://")));
                    const isImg =
                      typeof val === "string" &&
                      (val.startsWith("data:image") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(val));

                    return (
                      <div
                        key={idx}
                        className="bg-gray-50/70 dark:bg-gray-800/70 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            {field.name}
                          </p>
                          <span className="text-[11px] font-medium text-gray-400">
                            Type: {field.type}
                          </span>
                        </div>

                        {field.type === "url" ? (
                          <a
                            href={val}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 hover:underline text-sm font-semibold break-all"
                          >
                            <ExternalLink size={14} className="shrink-0" />
                            {val || "—"}
                          </a>
                        ) : isFileOrUrl && fileUrl ? (
                          <div className="mt-2 space-y-3">
                            {isImg && (
                              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-md bg-white dark:bg-gray-900 p-2 shadow-sm">
                                <img
                                  src={fileUrl}
                                  alt="Uploaded file preview"
                                  className="w-full h-auto max-h-72 object-contain rounded-lg"
                                />
                              </div>
                            )}

                            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-teal-200 dark:border-teal-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0">
                                  <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {val.split("/").pop() || "Uploaded File"}
                                  </p>
                                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                                    Ready to view or download
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm"
                                  title="Open file in a new tab"
                                >
                                  <Eye size={14} /> Open File
                                </a>
                                <a
                                  href={fileUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                                  title="Download file to computer"
                                >
                                  <Download size={14} /> Download
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium">
                            {val !== undefined && val !== null ? String(val) : "—"}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Render any additional data in submission that wasn't in fields */}
                  {submission.data &&
                    Object.entries(submission.data)
                      .filter(([k]) => !k.endsWith("_filename") && !k.endsWith("_size"))
                      .filter(([k]) => !phaseConfig?.fields?.some((f) => f.name === k))
                      .map(([key, value], idx) => {
                        const fileUrl = getFullFileUrl(value);
                        const isFile =
                          typeof value === "string" &&
                          (value.startsWith("/uploads/") || value.startsWith("http://") || value.startsWith("https://"));

                        return (
                          <div
                            key={`extra-${idx}`}
                            className="bg-gray-50/70 dark:bg-gray-800/70 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700"
                          >
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                              {key}
                            </p>
                            {isFile && fileUrl ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm"
                                >
                                  <Eye size={14} /> Open File
                                </a>
                                <a
                                  href={fileUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                                >
                                  <Download size={14} /> Download
                                </a>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium">
                                {String(value)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                </div>

                {phaseConfig?.fields?.length === 0 && (
                  <p className="text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    No specific upload fields were required for this phase.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Student has not submitted requirements for this phase yet.
                </p>
              </div>
            )}
          </div>

          {/* Review Notes Section */}
          {submission && submission.status === "PENDING_REVIEW" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                Feedback / Review Notes{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (Optional - will be shown to the student)
                </span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 text-sm"
                rows="3"
                placeholder="Provide evaluation notes, feedback, or instructions for the student..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/70 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold text-sm transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            Close
          </button>

          {submission && submission.status === "PENDING_REVIEW" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleReview("REJECTED")}
                disabled={loading}
                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all flex items-center gap-2 font-bold text-sm shadow-sm disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject Phase
              </button>
              <button
                onClick={() => handleReview("APPROVED")}
                disabled={loading}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-sm shadow-md disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Approve Phase
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewModal;
