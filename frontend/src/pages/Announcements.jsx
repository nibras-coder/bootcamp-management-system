import { useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import { Plus, X, Trash2 } from "lucide-react";

const initialAnnouncements = [
  {
    id: 1,
    title: "React Assignment Deadline Extended",
    content: "The deadline for the React Components assignment is moved to May 22.",
    targetAudience: "batch",
    publishDate: "2026-05-14",
  },
  {
    id: 2,
    title: "Mentorship Session Tomorrow",
    content: "Join us at 5 PM for a live Q&A session on API integration.",
    targetAudience: "batch",
    publishDate: "2026-05-13",
  },
];

const audienceLabels = {
  all: "Everyone",
  students: "All Students",
  mentors: "All Mentors",
  batch: "My Batch",
};

function Announcements() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "batch",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert("Title and content are required");
      return;
    }

    // TODO: send formData to backend via POST /api/announcements
    const newAnnouncement = {
      id: Date.now(),
      ...formData,
      publishDate: new Date().toISOString().split("T")[0],
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({ title: "", content: "", targetAudience: "batch" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    // TODO: send DELETE to backend via DELETE /api/announcements/:id
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-500 text-sm">Share updates with your batch.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-teal-900"
          >
            <Plus size={16} />
            New Announcement
          </button>
        </div>

        <div className="space-y-4">
          {announcements.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.content}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                      {audienceLabels[item.targetAudience]}
                    </span>
                    <span className="text-xs text-gray-400">{item.publishDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">No announcements yet.</p>
          )}
        </div>

        {/* New announcement modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">New Announcement</h3>
                <button onClick={() => setShowForm(false)}>
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                />
                <textarea
                  name="content"
                  placeholder="Content"
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                />
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                >
                  <option value="batch">My Batch</option>
                  <option value="students">All Students</option>
                  <option value="all">Everyone</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900"
                >
                  Publish Announcement
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Announcements;