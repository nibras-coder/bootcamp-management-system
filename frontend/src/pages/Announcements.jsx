import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Plus, X, Trash2, Megaphone, Loader2, Calendar , Menu } from "lucide-react";

function Announcements() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, confirm } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "students",
    batch: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, batchRes] = await Promise.all([
        API.get("/announcements"),
        API.get("/batches/my-batches"),
      ]);
      if (annRes.data.success) {
        setAnnouncements(annRes.data.data || []);
      }
      if (batchRes.data.success) {
        const list = batchRes.data.data || [];
        setBatches(list);
        if (list.length > 0 && !formData.batch) {
          setFormData((prev) => ({ ...prev, batch: list[0]._id }));
        }
      }
    } catch (err) {
      console.error("Failed to load mentor announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      content: "",
      targetAudience: "students",
      batch: batches.length > 0 ? batches[0]._id : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.warning("Title and content are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        batch: formData.batch || null,
      };
      const res = await API.post("/announcements", payload);
      if (res.data.success) {
        toast.success("Announcement published successfully");
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Announcement",
      message: "Are you sure you want to delete this announcement?",
      confirmText: "Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await API.delete(`/announcements/${id}`);
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
        toast.success("Announcement deleted");
      } catch (err) {
        toast.error("Failed to delete announcement");
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-teal-900 dark:bg-black text-white mb-5 rounded-xl border border-teal-800 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-teal-800 text-teal-200"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold text-sm">Announcements</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Megaphone className="text-teal-600 dark:text-teal-400" size={26} />
              Announcements
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Broadcast critical updates and notices to students in your mentorship track
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>New Announcement</span>
          </button>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={28} />
            <p className="text-sm">Loading announcements...</p>
          </div>
        ) : announcements.length ? (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {item.title}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium">
                        {item.batch?.name || item.batch?.track || "Track Broadcast"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {item.content}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                      <Calendar size={13} />
                      <span>Published on {new Date(item.publishDate || item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
            No announcements published yet. Click "New Announcement" to send one.
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Publish Announcement
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Live Q&A Session Tomorrow at 5 PM"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Track / Batch *
                  </label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All My Students / General Broadcast</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name || b.track}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Content / Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write the announcement details..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-colors"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    <span>Post Announcement</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Announcements;
