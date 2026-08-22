import { useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";

function Settings() {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 6) {
      setToast({ type: "error", message: "New password must be at least 6 characters" });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setToast({ type: "error", message: "New password and confirmation do not match" });
      return;
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setToast({ type: "success", message: "Password changed successfully" });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to change password" });
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm mb-6">Change your account password.</p>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Current Password</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">New Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <button type="submit" className="w-full bg-teal-800 text-white py-2.5 rounded-lg text-sm hover:bg-teal-900">Update Password</button>
          </form>
        </div>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default Settings;
