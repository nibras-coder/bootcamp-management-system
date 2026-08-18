import React, { useState } from "react";
import { Megaphone, Plus, Calendar, Trash2, X } from "lucide-react";

const initialAnnouncements = [
  {
    id: 1,
    title: "Welcome to the MSJ Summer Bootcamp!",
    content:
      "We are excited to have you all here. Please check your emails for the introductory materials.",
    date: "2026-05-09",
    author: "Admin User",
    target: "All Batches",
  },
  {
    id: 2,
    title: "Weekly Experience Sharing",
    content:
      "Guest speaker from Google joining us this Friday to share insights on system design.",
    date: "2026-08-10",
    author: "Admin User",
    target: "All Batches",
  },
  {
    id: 3,
    title: "Codeforces Contest #842",
    content:
      "The weekly contest is mandatory for all CP students. Make sure your handles are registered.",
    date: "2026-08-16",
    author: "Jemal Yassin",
    target: "DSA & CP",
  },
];

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target: "All Batches",
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const date = new Date().toISOString().split("T")[0];
    setAnnouncements([
      { ...newAnnouncement, id: Date.now(), date, author: "Admin User" },
      ...announcements,
    ]);
    setIsModalOpen(false);
    setNewAnnouncement({ title: "", content: "", target: "All Batches" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this announcement?")) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
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
            key={ann.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative"
          >
            <button
              onClick={() => handleDelete(ann.id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex justify-between items-start mb-2 pr-8">
              <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
              <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                To: {ann.target}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{ann.content}</p>
            <div className="flex items-center text-xs text-gray-400 space-x-4 border-t border-gray-100 pt-4">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{ann.date}</span>
              </div>
              <div>Posted by: {ann.author}</div>
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
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                New Announcement
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  required
                  value={newAnnouncement.target}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      target: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500"
                >
                  <option value="All Batches">All Batches</option>
                  <option value="Web Dev Bootcamp">Web Dev Bootcamp</option>
                  <option value="DSA & CP">
                    DSA & Competitive Programming
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
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
    </div>
  );
};

export default AnnouncementsPage;
