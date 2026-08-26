import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Plus, X, Edit, Trash2, ExternalLink, FileText, Loader2, Calendar , Menu } from "lucide-react";

function Assignments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, confirm } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    batch: "",
    deadline: "",
    maxScore: 100,
    link: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [asgRes, batchRes] = await Promise.all([
        API.get("/assignments"),
        API.get("/batches/my-batches"),
      ]);
      if (asgRes.data.success) {
        setAssignments(asgRes.data.data || []);
      }
      if (batchRes.data.success) {
        const list = batchRes.data.data || [];
        setBatches(list);
        if (list.length > 0 && !formData.batch) {
          setFormData((prev) => ({ ...prev, batch: list[0]._id }));
        }
      }
    } catch (err) {
      console.error("Failed to load mentor assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setFormData({
      title: "",
      description: "",
      batch: batches.length > 0 ? batches[0]._id : "",
      deadline: "",
      maxScore: 100,
      link: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      batch: assignment.batch?._id || assignment.batch || "",
      deadline: assignment.deadline ? assignment.deadline.split("T")[0] : "",
      maxScore: assignment.maxScore || 100,
      link: assignment.link || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      toast.warning("Title and deadline are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        batch: formData.batch || null,
      };
      if (editingAssignment) {
        const res = await API.put(`/assignments/${editingAssignment._id}`, payload);
        if (res.data.success) {
          toast.success("Assignment updated successfully");
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await API.post("/assignments", payload);
        if (res.data.success) {
          toast.success("Assignment created successfully");
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Assignment",
      message: "Are you sure you want to delete this assignment?",
      confirmText: "Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await API.delete(`/assignments/${id}`);
        setAssignments((prev) => prev.filter((a) => a._id !== id));
        toast.success("Assignment deleted");
      } catch (err) {
        toast.error("Failed to delete assignment");
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
            <span className="font-bold text-sm">Assignments</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <FileText className="text-teal-600 dark:text-teal-400" size={26} />
              Assignments
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Create, review, and manage assignments for your bootcamp tracks
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>New Assignment</span>
          </button>
        </div>

        {/* Assignments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={28} />
              <p className="text-sm">Loading assignments...</p>
            </div>
          ) : assignments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3.5">Assignment</th>
                    <th className="px-6 py-3.5">Track</th>
                    <th className="px-6 py-3.5">Deadline</th>
                    <th className="px-6 py-3.5">Max Points</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {assignments.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</div>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate max-w-sm mt-0.5">{item.description}</p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline mt-1"
                          >
                            <ExternalLink size={11} /> Problem Link
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {item.batch?.name || item.batch?.track || "All Tracks"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                        {item.deadline ? new Date(item.deadline).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-teal-700 dark:text-teal-400">
                        {item.maxScore || 100} pts
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit Assignment"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Delete Assignment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No assignments created yet. Click "New Assignment" to post one.
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingAssignment ? "Edit Assignment" : "New Assignment"}
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
                    placeholder="e.g. Dynamic Programming Contest #1"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Track / Batch
                  </label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All Tracks / Open</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name || b.track}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide assignment guidelines or problem statements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Max Points
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Problem / Contest Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://codeforces.com/contest/..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    <span>{editingAssignment ? "Update Assignment" : "Publish Assignment"}</span>
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

export default Assignments;
