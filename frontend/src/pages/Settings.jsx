import { useState, useEffect } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Settings as SettingsIcon, Bell, Lock, Loader2, Save , Menu } from "lucide-react";

function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    announcementNotifications: true,
    assignmentNotifications: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    API.get("/settings")
      .then((res) => {
        if (res.data.success && res.data.data) {
          setSettings(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggle = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSavingSettings(true);
    try {
      await API.patch("/settings", updated);
      toast.success("Notification settings updated");
    } catch (err) {
      toast.error("Failed to update preferences");
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword.length < 6) {
      toast.warning("New password must be at least 6 characters");
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast.warning("New passwords do not match");
      return;
    }
    setSavingPwd(true);
    try {
      const res = await API.put("/profile/password", {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
      });
      if (res.data.success) {
        toast.success("Password updated successfully");
        setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 overflow-y-auto max-w-4xl space-y-6">
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
            <span className="font-bold text-sm">Settings</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <SettingsIcon className="text-teal-600 dark:text-teal-400" size={26} />
            Portal Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Customize mentor notifications and account security preferences
          </p>
        </div>

        {/* Notifications Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
            <Bell className="text-teal-600 dark:text-teal-400" size={20} />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors">
              <div>
                <strong className="block text-sm text-gray-900 dark:text-white">Email Summaries</strong>
                <span className="text-xs text-gray-400">Receive periodic emails on student activity and deadlines</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.emailNotifications)}
                onChange={() => handleToggle("emailNotifications")}
                className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors">
              <div>
                <strong className="block text-sm text-gray-900 dark:text-white">New Submission Alerts</strong>
                <span className="text-xs text-gray-400">Get notified when a student submits work ready for grading</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.assignmentNotifications)}
                onChange={() => handleToggle("assignmentNotifications")}
                className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors">
              <div>
                <strong className="block text-sm text-gray-900 dark:text-white">Announcement Broadcasts</strong>
                <span className="text-xs text-gray-400">Receive system and admin level notifications</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.announcementNotifications)}
                onChange={() => handleToggle("announcementNotifications")}
                className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Security / Password Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4 max-w-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
            <Lock className="text-teal-600 dark:text-teal-400" size={20} />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={pwdData.currentPassword}
                onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={pwdData.newPassword}
                onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={pwdData.confirmPassword}
                onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPwd}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-colors"
              >
                {savingPwd && <Loader2 size={16} className="animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Settings;
