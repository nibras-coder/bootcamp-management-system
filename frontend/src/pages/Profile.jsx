import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";
import { Camera } from "lucide-react";

function Profile() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [userId, setUserId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        const user = res.data.user;
        setUserId(user._id);
        setFormData({ name: user.name, email: user.email, phone: user.phone || "" });
        if (user.avatarUrl) setPhotoPreview(user.avatarUrl);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // NOTE: photo upload requires backend multer support — not yet wired.
      // Text fields (name, email, phone) save normally below.
      await api.put(`/users/${userId}`, formData);
      setEditing(false);
      setToast({ type: "success", message: "Profile updated successfully" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to update profile" });
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8"><p className="text-gray-500">Loading...</p></main>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your account information.</p>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-teal-100 overflow-hidden">
                {photoPreview && <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />}
              </div>
              {editing && (
                <label className="absolute -bottom-1 -right-1 bg-teal-800 p-1.5 rounded-full cursor-pointer hover:bg-teal-900">
                  <Camera size={12} className="text-white" />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{formData.name}</p>
              <p className="text-sm text-gray-500">Mentor</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editing} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!editing} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!editing} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-400" />
            </div>

            {editing ? (
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className="w-full bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900">Edit Profile</button>
            )}
          </form>
        </div>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default Profile;
