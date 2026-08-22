import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";
import { Plus, X } from "lucide-react";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [myBatchId, setMyBatchId] = useState(null);
  const [formData, setFormData] = useState({
    title: "", description: "", instructions: "", deadline: "", maxScore: 100,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsRes, studentsRes] = await Promise.all([
          api.get("/assignments"),
          api.get("/users", { params: { role: "student" } }),
        ]);
        setAssignments(assignmentsRes.data.assignments);
        if (studentsRes.data.users[0]?.batch) setMyBatchId(studentsRes.data.users[0].batch);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load assignments" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      setToast({ type: "error", message: "Title and deadline are required" });
      return;
    }
    try {
      const res = await api.post("/assignments", { ...formData, batch: myBatchId });
      setAssignments([res.data.assignment, ...assignments]);
      setFormData({ title: "", description: "", instructions: "", deadline: "", maxScore: 100 });
      setShowForm(false);
      setToast({ type: "success", message: "Assignment created" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to create assignment" });
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-500 text-sm">Create and manage assignments for your batch.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-teal-800 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-teal-900"
          >
            <Plus size={16} />
            New Assignment
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-normal">Title</th>
                  <th className="pb-3 font-normal">Deadline</th>
                  <th className="pb-3 font-normal">Max Score</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-800">{item.title}</td>
                    <td className="py-3 text-gray-600">{new Date(item.deadline).toLocaleDateString()}</td>
                    <td className="py-3 text-gray-600">{item.maxScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && assignments.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No assignments yet.</p>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">New Assignment</h3>
                <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                <textarea name="description" placeholder="Description" rows={3} value={formData.description} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                <input type="number" name="maxScore" placeholder="Max Score" value={formData.maxScore} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                <button type="submit" className="w-full bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900">Create Assignment</button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default Assignments;
