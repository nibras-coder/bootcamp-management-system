import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Loader2,
  FileText,
  Video,
  Link as LinkIcon,
  Code,
  Download,
  X,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Menu,
} from "lucide-react";

const categoryIcons = {
  Document: FileText,
  Video: Video,
  Link: LinkIcon,
  Cheatsheet: FileText,
  Code: Code,
  Book: BookOpen,
};

const categoryColors = {
  Document: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Video: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  Link: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Cheatsheet: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Code: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Book: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
};

function Resources() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, confirm } = useToast();
  const [resources, setResources] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, admin, mine
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Document",
    target: "My Assigned Students",
    link: "",
    file: null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, batchRes] = await Promise.all([
        API.get("/resources"),
        API.get("/batches"),
      ]);
      if (resRes.data.success) {
        setResources(resRes.data.data || []);
      }
      if (batchRes.data.success) {
        setBatches(batchRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load resources:", err);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      title: "",
      description: "",
      category: "Document",
      target: "My Assigned Students",
      link: "",
      file: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.warning("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("description", formData.description);
      dataToSend.append("category", formData.category);
      dataToSend.append("target", formData.target);
      if (formData.link) dataToSend.append("link", formData.link);
      if (formData.file) dataToSend.append("file", formData.file);

      const res = await API.post("/resources", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Resource shared with your students successfully!");
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to share resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Resource",
      message: "Are you sure you want to remove this learning resource?",
      confirmText: "Delete",
      type: "danger",
    });
    if (ok) {
      try {
        await API.delete(`/resources/${id}`);
        setResources((prev) => prev.filter((r) => r._id !== id));
        toast.success("Resource deleted successfully");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete resource");
      }
    }
  };

  const isMyResource = (resource) => {
    const uploaderId = resource.uploadedBy?._id || resource.uploadedBy;
    return String(uploaderId) === String(user.id || user._id);
  };

  const isFromAdmin = (resource) => {
    return resource.uploadedBy?.role === "admin" || !resource.uploadedBy;
  };

  const filteredResources = resources.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.target && r.target.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (activeFilter === "mine") return isMyResource(r);
    if (activeFilter === "admin") return isFromAdmin(r);
    return true;
  });

  const myResourcesCount = resources.filter(isMyResource).length;
  const adminResourcesCount = resources.filter(isFromAdmin).length;

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
            <span className="font-bold text-sm">Resources</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <BookOpen className="text-teal-600 dark:text-teal-400" size={26} />
              Learning Resources & Materials
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Share study materials with your assigned students and explore track resources from admin.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Share Resource</span>
          </button>
        </div>

        {/* Filter KPI Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              }`}
            >
              All Resources ({resources.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("mine")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "mine"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              }`}
            >
              Shared by You ({myResourcesCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("admin")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "admin"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
              }`}
            >
              From Admin ({adminResourcesCount})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources by title or track..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={32} />
            <p className="text-sm">Loading resources library...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((resource) => {
              const IconComp = categoryIcons[resource.category] || FileText;
              const badgeColor = categoryColors[resource.category] || categoryColors.Document;
              const isMine = isMyResource(resource);

              return (
                <div
                  key={resource._id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Card Header Tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                        <IconComp size={13} />
                        <span>{resource.category || "Document"}</span>
                      </span>

                      {isMine ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                          <UserCheck size={11} /> Shared by You
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          <ShieldCheck size={11} /> From Admin
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-3 leading-relaxed">
                      {resource.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium">
                        Target: {resource.target || "All Tracks"}
                      </span>
                      {resource.uploadedBy?.name && (
                        <span>By {resource.uploadedBy.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {resource.link && (
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>Open Link</span>
                        </a>
                      )}
                      {resource.fileUrl && (
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                      )}
                    </div>

                    {isMine && (
                      <button
                        type="button"
                        onClick={() => handleDelete(resource._id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <BookOpen size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No resources found matching your filter.</p>
            <p className="text-xs text-gray-400 mt-1">Click "Share Resource" to upload study materials for your students.</p>
          </div>
        )}

        {/* Share Resource Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                  <Sparkles size={20} />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Share Learning Resource
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete React Cheatsheet & Hooks Guide"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Document">Document (PDF/Doc)</option>
                      <option value="Video">Video / Recording</option>
                      <option value="Link">Useful Link</option>
                      <option value="Cheatsheet">Cheatsheet</option>
                      <option value="Code">Code Repository</option>
                      <option value="Book">E-Book</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="My Assigned Students">My Assigned Students</option>
                      <option value="All Tracks">All Tracks</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Data Science">Data Science</option>
                      {batches.map((b) => (
                        <option key={b._id} value={b.name || b.track}>
                          {b.name || b.track}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description & Overview *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly explain what this resource covers and how students should use it..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Resource Link / URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or https://github.com/..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Attach File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 dark:file:bg-teal-950 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-teal-100"
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
                    <span>Share Resource</span>
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

export default Resources;
