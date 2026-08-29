import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import ApplicationReviewModal from "../../components/admin/ApplicationReviewModal";

const ApplicationsPage = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [existingTrackInfo, setExistingTrackInfo] = useState(null);
  const [checkingOtherTrack, setCheckingOtherTrack] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await API.get("/batches");
      if (response.data.success) {
        const batchesData = [{ _id: "all", name: "All Tracks" }, ...response.data.data];
        setBatches(batchesData);
        if (batchesData.length > 0) {
           setSelectedBatch(batchesData[0]);
           fetchApplications(batchesData[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const fetchApplications = async (batchId) => {
    setLoading(true);
    try {
      const response = await API.get(`/applications/batch/${batchId}`);
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (batchId) => {
    const batch = batches.find(b => b._id === batchId);
    setSelectedBatch(batch);
    fetchApplications(batchId);
  };

  const checkOtherTrackApplication = async (studentId, currentBatchId) => {
    setCheckingOtherTrack(true);
    try {
      const response = await API.get(`/applications/student/${studentId}`);
      if (response.data.success) {
        const otherApps = response.data.data.filter(
          app => String(app.batch?._id) !== String(currentBatchId) && app.status === "ACCEPTED"
        );
        if (otherApps.length > 0) {
          setExistingTrackInfo(otherApps[0]);
        } else {
          setExistingTrackInfo(null);
        }
      }
    } catch (error) {
      console.error("Failed to check other track applications:", error);
      setExistingTrackInfo(null);
    } finally {
      setCheckingOtherTrack(false);
    }
  };

  const handleReview = (app) => {
    setSelectedApp(app);
    checkOtherTrackApplication(app.student?._id, app.batch?._id);
    setIsReviewModalOpen(true);
  };

  const filteredApps = applications.filter(app => 
    app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">ACCEPTED</span>;
      case "REJECTED":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">REJECTED</span>;
      case "IN_PROGRESS":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">IN PROGRESS</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

        
        <div className="flex space-x-2">
           <select 
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={selectedBatch?._id || ""}
              onChange={(e) => handleBatchSelect(e.target.value)}
           >
             {batches.map(b => (
               <option key={b._id} value={b._id}>{b.name}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
           <div className="relative max-w-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-gray-400" />
             </div>
             <input
               type="text"
               className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
               placeholder="Search applicant..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Phase</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No applications found for this batch.</td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {app.student?.profilePhoto ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={app.student.profilePhoto} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold">
                              {app.student?.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{app.student?.name}</div>
                          <div className="text-sm text-gray-500">{app.student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Phase {app.currentPhaseOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleReview(app)}
                        className="text-teal-600 hover:text-teal-900 dark:hover:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg inline-flex items-center transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApplicationReviewModal 
         isOpen={isReviewModalOpen}
         onClose={() => { setIsReviewModalOpen(false); setSelectedApp(null); setExistingTrackInfo(null); }}
         application={selectedApp}
         batch={selectedBatch}
         existingTrackInfo={existingTrackInfo}
         checkingOtherTrack={checkingOtherTrack}
         onReviewed={() => fetchApplications(selectedBatch?._id)}
      />
    </div>
  );
};

export default ApplicationsPage;
