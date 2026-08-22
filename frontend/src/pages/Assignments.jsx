import { useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import { Plus, X, Paperclip } from "lucide-react";

const initialAssignments = [
  {
    id: 1,
    title: "React Components",
    description: "Build 3 reusable components with props.",
    deadline: "2026-05-20",
    maxScore: 100,
    fileName: null,
  },
  {
    id: 2,
    title: "API Integration",
    description: "Connect a frontend form to a REST API.",
    deadline: "2026-05-22",
    maxScore: 100,
    fileName: null,
  },
];

function Assignments() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    deadline: "",
    maxScore: 100,
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.deadline) {
      alert("Title and deadline are required");
      return;
    }

    // This is what you'll send once file upload is ready on backend:
    // const data = new FormData();
    // data.append("title", formData.title);
    // data.append("description", formData.description);
    // data.append("instructions", formData.instructions);
    // data.append("deadline", formData.deadline);
    // data.append("maxScore", formData.maxScore);
    // if (file) data.append("attachment", file);
    // await axios.post("http://localhost:5000/api/assignments", data, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });

    const newAssignment = {
      id: Date.now(),
      ...formData,
      fileName: file ? file.name : null,
    };

    setAssignments([newAssignment, ...assignments]);
    setFormData({
      title: "",
      description: "",
      instructions: "",
      deadline: "",
      maxScore: 100,
    });
    setFile(null);
    setShowForm(false);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-500 text-sm">
              Create and manage assignments for your .
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-teal-900"
          >
            <Plus size={16} />
            New Assignment
          </button>
        </div>

        {/* Assignment list */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-normal">Title</th>
                <th className="pb-3 font-normal">Deadline</th>
                <th className="pb-3 font-normal">Max Score</th>
                <th className="pb-3 font-normal">Attachment</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 text-gray-800">{item.title}</td>
                  <td className="py-3 text-gray-600">{item.deadline}</td>
                  <td className="py-3 text-gray-600">{item.maxScore}</td>
                  <td className="py-3 text-gray-600">
                    {item.fileName ? (
                      <span className="flex items-center gap-1 text-teal-700">
                        <Paperclip size={14} />
                        {item.fileName}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New assignment modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">New Assignment</h3>
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
                  name="description"
                  placeholder="Description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                />
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                />
                <input
                  type="number"
                  name="maxScore"
                  placeholder="Max Score"
                  value={formData.maxScore}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                />

                {/* File upload */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Attachment (optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                  />
                  {file && (
                    <p className="text-xs text-teal-700 mt-1 flex items-center gap-1">
                      <Paperclip size={12} />
                      {file.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900"
                >
                  Create Assignment
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Assignments;
