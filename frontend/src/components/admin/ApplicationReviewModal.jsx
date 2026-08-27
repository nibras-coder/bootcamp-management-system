import React, { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const ApplicationReviewModal = ({ isOpen, onClose, application, batch, onReviewed }) => {
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !application || !batch) return null;

  const currentPhaseOrder = application.currentPhaseOrder;
  const phaseConfig = batch.phases?.find(p => p.order === currentPhaseOrder);
  const submission = application.submissions?.find(s => s.phaseId === phaseConfig?._id);

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
        reviewNotes
      });
      if (response.data.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Application</h2>
            <p className="text-sm text-gray-500">Applicant: {application.student?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Phase {currentPhaseOrder}: {phaseConfig?.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{phaseConfig?.shortMessage}</p>
            
            {submission ? (
               <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                 <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Submitted Data:</h4>
                 {phaseConfig?.fields?.map((field, idx) => (
                   <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700 shadow-sm">
                     <p className="text-xs text-gray-500 mb-1">{field.name}</p>
                     {field.type === 'url' ? (
                       <a href={submission.data[field.name]} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline text-sm break-all">
                         {submission.data[field.name]}
                       </a>
                     ) : (
                       <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{submission.data[field.name] || "—"}</p>
                     )}
                   </div>
                 ))}
                 {phaseConfig?.fields?.length === 0 && (
                   <p className="text-sm text-gray-500 italic">No specific fields were required for this phase.</p>
                 )}
               </div>
            ) : (
               <div className="text-center py-6 text-gray-500 italic">
                 Student has not submitted data for this phase yet.
               </div>
            )}
          </div>
          
          {submission && submission.status === "PENDING_REVIEW" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Notes (Optional)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                rows="3"
                placeholder="Add any internal notes or feedback for the student..."
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
            Close
          </button>
          
          {submission && submission.status === "PENDING_REVIEW" && (
            <div className="flex space-x-3">
              <button 
                onClick={() => handleReview("REJECTED")} 
                disabled={loading}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors flex items-center font-medium disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </button>
              <button 
                onClick={() => handleReview("APPROVED")} 
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors flex items-center font-medium shadow-sm disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve Phase
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewModal;
