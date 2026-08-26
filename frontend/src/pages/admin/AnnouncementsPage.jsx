import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Calendar, Trash2, X, Edit } from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const AnnouncementsPage = () => {
  const { toast, confirm } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetAudience: "all",
  });
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    fetchAnnouncements();
    fetchBatches();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await API.get("/announcements/all");
      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await API.get("/batches");
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (!selectedBatch) {
        toast.warning("Please select a batch or 'All Tracks'");
        return;
      }

      const payload = {
        ...newAnnouncement,
        batch: selectedBatch === "all" ? null : selectedBatch,
      };

      const response = await API.post("/announcements", payload);
      if (response.data.success) {
        setAnnouncements([response.data.data, ...announcements]);
        setIsModalOpen(false);
        toast.success("Announcement published successfully");
        setNewAnnouncement({ title: "", content: "", targetAudience: "all" });
        setSelectedBatch("");
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
      toast.error(error.response?.data?.message || "Failed to create announcement");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(
        `/announcements/${editingAnnouncement._id}`,
        editingAnnouncement,
      );
      if (response.data.success) {
        setAnnouncements(
          announcements.map((a) =>
            a._id === editingAnnouncement._id ? response.data.data : a,
          ),
        );
        setIsEditModalOpen(false);
        setEditingAnnouncement(null);
        toast.success("Announcement updated successfully");
      }
    } catch (error) {
      console.error("Failed to update announcement:", error);
      toast.error(error.response?.data?.message || "Failed to update announcement");
    }
  };
  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Announcement",
      message: "Are you sure you want to delete this announcement?",
      confirmText: "Yes, Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await API.delete(`/announcements/${id}`);
        setAnnouncements(announcements.filter((a) => a._id !== id));
        toast.success("Announcement deleted successfully");
      } catch (error) {
        console.error("Failed to delete announcement:", error);
        toast.error(error.response?.data?.message || "Failed to delete announcement");
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Announcements</h2>
            <p className="text-sm text-gray-500">
              Manage and broadcast messages
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <Plus size={18} />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann._id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group relative"
          >
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditingAnnouncement(ann);
                  setIsEditModalOpen(true);
                }}
                className="text-gray-300 hover:text-teal-600"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(ann._id)}
                className="text-gray-300 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="flex justify-between items-start mb-2 pr-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{ann.title}</h3>
              <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:text-gray-300">
                To: {ann.targetAudience || "all"}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{ann.content}</p>
            <div className="flex items-center text-xs text-gray-400 space-x-4 border-t border-gray-100 pt-4">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(ann.publishDate).toLocaleDateString()}</span>
              </div>
              <div>Posted by: {ann.author?.name || "Admin"}</div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No announcements found.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                New Announcement
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="e.g. Guest Speaker Session"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Track
                </label>
                <select
                  required
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 mb-4"
                >
                  <option value="all">All Tracks</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name || b.track}
                    </option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Audience
                </label>
                <select
                  required
                  value={newAnnouncement.targetAudience}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      targetAudience: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                >
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="mentors">Mentors</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  required
                  rows="4"
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  placeholder="Type message here..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                  value={newAnnouncement.link || ""}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      link: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Edit Announcement
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={editingAnnouncement.title}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Audience
                </label>
                <select
                  required
                  value={editingAnnouncement.target}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      target: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                >
                  <option value="All Tracks">All Tracks</option>
                  <option value="Web Dev Bootcamp">Web Dev Bootcamp</option>
                  <option value="DSA & CP">
                    DSA & Competitive Programming
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  required
                  rows="4"
                  value={editingAnnouncement.content}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      content: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
