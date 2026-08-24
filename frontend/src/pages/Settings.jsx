import { useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";

function Settings() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = formData;

    // Validate current password
    if (!currentPassword) {
      setToast({
        type: "error",
        message: "Please enter your current password.",
      });
      return;
    }

    // Validate new password
    if (newPassword.length < 6) {
      setToast({
        type: "error",
        message: "New password must be at least 6 characters.",
      });
      return;
    }

    // Make sure new password is different
    if (currentPassword === newPassword) {
      setToast({
        type: "error",
        message: "New password must be different from your current password.",
      });
      return;
    }

    // Confirm password
    if (newPassword !== confirmPassword) {
      setToast({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setToast({
        type: "success",
        message:
          response.data?.message ||
          "Password changed successfully.",
      });

      // Clear form after successful password change
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to change password. Please try again.";

      setToast({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-md">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mb-6 text-sm text-gray-500">
            Manage your account and security settings.
          </p>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">
              Change Password
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Update your password to keep your account secure.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Password must contain at least 6 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-800 py-2.5 text-sm font-medium text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default Settings;