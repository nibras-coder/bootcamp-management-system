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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-teal-50/50 to-transparent dark:from-teal-900/20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400">Review Application</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Applicant: {application.student?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-full transition-all shadow-sm border border-gray-200/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 text-gray-500 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm">Phase {currentPhaseOrder}</span>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{phaseConfig?.name}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{phaseConfig?.shortMessage}</p>
            
            {submission ? (
               <div className="space-y-5 border-t border-gray-200/60 dark:border-gray-700/60 pt-6">
                 <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center tracking-wide uppercase">
                   <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span> Submitted Data
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {phaseConfig?.fields?.map((field, idx) => (
                     <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
                       <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 group-hover:text-teal-500 transition-colors">{field.name}</p>
                       {field.type === 'url' ? (
                         <a href={submission.data[field.name]} target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline text-sm font-medium break-all flex items-center">
                           {submission.data[field.name]}
                         </a>
                       ) : field.type === 'file' ? (
                         <div className="mt-2">
                           {submission.data[field.name] && submission.data[field.name].startsWith('data:image') ? (
                             <img src={submission.data[field.name]} alt="Submission file" className="max-w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
                           ) : submission.data[field.name] ? (
                             <a href={submission.data[field.name]} download={`submission_${field.name}`} className="inline-flex items-center px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors text-sm font-bold">
                               Download File
                             </a>
                           ) : (
                             <p className="text-sm text-gray-500">—</p>
                           )}
                         </div>
                       ) : (
                         <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium">{submission.data[field.name] || "—"}</p>
                       )}
                     </div>
                   ))}
                 </div>
                 {phaseConfig?.fields?.length === 0 && (
                   <p className="text-sm text-gray-500 italic bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">No specific fields were required for this phase.</p>
                 )}
               </div>
            ) : (
               <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                 <p className="text-gray-500 font-medium">Student has not submitted data for this phase yet.</p>
               </div>
            )}
          </div>
          
          {submission && submission.status === "PENDING_REVIEW" && (
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                Review Notes <span className="text-gray-400 font-normal ml-2 text-xs">(Optional, visible to student)</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300/80 dark:border-gray-600/80 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-inner"
                rows="3"
                placeholder="Add constructive feedback or internal notes..."
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-all shadow-sm border border-gray-200 dark:border-gray-700">
            Close
          </button>
          
          {submission && submission.status === "PENDING_REVIEW" && (
            <div className="flex space-x-3">
              <button 
                onClick={() => handleReview("REJECTED")} 
                disabled={loading}
                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all flex items-center font-bold shadow-sm disabled:opacity-50"
              >
                <XCircle className="w-5 h-5 mr-2" /> Reject
              </button>
              <button 
                onClick={() => handleReview("APPROVED")} 
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl transition-all flex items-center font-bold shadow-md hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5"
              >
                <CheckCircle className="w-5 h-5 mr-2" /> Approve Phase
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewModal;
