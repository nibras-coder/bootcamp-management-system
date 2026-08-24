import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, X, Link as LinkIcon, Paperclip } from "lucide-react";
import API from "../../api/axios";

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    target: "All Tracks",
    link: "",
    fileUrl: "",
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await API.get("/resources");
      if (response.data.success) {
        setResources(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", newResource.title);
      formData.append("description", newResource.description);
      formData.append("target", newResource.target);
      if (newResource.link) formData.append("link", newResource.link);
      if (newResource.file) formData.append("file", newResource.file);

      const response = await API.post("/resources", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        setResources([response.data.data, ...resources]);
        setIsModalOpen(false);
        setNewResource({ title: "", description: "", target: "All Tracks", link: "", file: null });
      }
    } catch (error) {
      console.error("Failed to add resource:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this resource?")) {
      try {
        await API.delete(`/resources/${id}`);
        setResources(resources.filter((r) => r._id !== id));
      } catch (error) {
        console.error("Failed to delete resource:", error);
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Resources</h2>
            <p className="text-sm text-gray-500">
              Manage study materials and links
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <Plus size={18} />
          <span>New Resource</span>
        </button>
      </div>

      <div className="space-y-4">
        {resources.map((res) => (
          <div
            key={res._id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group relative"
          >
            <button
              onClick={() => handleDelete(res._id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex justify-between items-start mb-2 pr-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{res.title}</h3>
              <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:text-gray-300">
                Track: {res.target}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{res.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {res.link && (
                <a href={res.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-teal-600 hover:underline">
                  <LinkIcon size={16} />
                  <span>{res.link}</span>
                </a>
              )}
              {res.fileUrl && (
                <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-gray-500 hover:text-teal-600 hover:underline">
                  <Paperclip size={16} />
                  <span>Attached File</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Add New Resource
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Track
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  value={newResource.target}
                  onChange={(e) =>
                    setNewResource({ ...newResource, target: e.target.value })
                  }
                >
                  <option>All Tracks</option>
                  <option>Web Development</option>
                  <option>Mobile Development</option>
                  <option>UI/UX Design</option>
                  <option>Data Science</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({ ...newResource, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  value={newResource.link}
                  onChange={(e) =>
                    setNewResource({ ...newResource, link: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attached File (Optional)
                </label>
                <input
                  type="file"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewResource({ ...newResource, file });
                    } else {
                      setNewResource({ ...newResource, file: null });
                    }
                  }}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
