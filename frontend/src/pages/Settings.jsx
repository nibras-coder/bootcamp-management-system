import { useEffect, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import Toast from "../components/shared/Toast";
import api from "../utils/api";
import {
  Bell,
  Mail,
  Megaphone,
  ClipboardList,
  Loader2,
  ShieldCheck,
} from "lucide-react";

function Settings() {
  // =====================================================
  // PASSWORD STATE
  // =====================================================

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =====================================================
  // NOTIFICATION STATE
  // =====================================================

  const [notificationSettings, setNotificationSettings] =
    useState({
      emailNotifications: true,
      announcementNotifications: true,
      assignmentNotifications: true,
    });

  const [loadingSettings, setLoadingSettings] =
    useState(true);

  const [savingNotification, setSavingNotification] =
    useState(null);

  // =====================================================
  // GENERAL STATE
  // =====================================================

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);

      const response = await api.get("/settings");

      const settings = response.data?.data || {};

      setNotificationSettings({
        emailNotifications:
          settings.emailNotifications ?? true,

        announcementNotifications:
          settings.announcementNotifications ?? true,

        assignmentNotifications:
          settings.assignmentNotifications ?? true,
      });
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to load notification settings.",
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

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

    if (!currentPassword) {
      setToast({
        type: "error",
        message:
          "Please enter your current password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setToast({
        type: "error",
        message:
          "New password must be at least 6 characters.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setToast({
        type: "error",
        message:
          "New password must be different from your current password.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        type: "error",
        message:
          "New password and confirmation do not match.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setToast({
        type: "success",
        message:
          response.data?.message ||
          "Password changed successfully.",
      });

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

  // =====================================================
  // UPDATE NOTIFICATION SETTING
  // =====================================================

  const handleNotificationToggle = async (
    settingName
  ) => {
    if (savingNotification) return;

    const newValue =
      !notificationSettings[settingName];

    // Update UI immediately
    setNotificationSettings((prev) => ({
      ...prev,
      [settingName]: newValue,
    }));

    try {
      setSavingNotification(settingName);

      const response = await api.patch(
        "/settings",
        {
          [settingName]: newValue,
        }
      );

      const savedSettings =
        response.data?.data;

      if (savedSettings) {
        setNotificationSettings({
          emailNotifications:
            savedSettings.emailNotifications ??
            true,

          announcementNotifications:
            savedSettings.announcementNotifications ??
            true,

          assignmentNotifications:
            savedSettings.assignmentNotifications ??
            true,
        });
      }

      setToast({
        type: "success",
        message: "Notification setting updated.",
      });
    } catch (error) {
      console.error(
        "Notification setting error:",
        error
      );

      // Revert UI if saving failed
      setNotificationSettings((prev) => ({
        ...prev,
        [settingName]: !newValue,
      }));

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update notification setting.",
      });
    } finally {
      setSavingNotification(null);
    }
  };

  // =====================================================
  // TOGGLE COMPONENT
  // =====================================================

  const NotificationToggle = ({
    settingName,
    title,
    description,
    icon: Icon,
  }) => {
    const enabled =
      notificationSettings[settingName];

    const saving =
      savingNotification === settingName;

    return (
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-teal-50 flex items-center justify-center">
            <Icon
              size={18}
              className="text-teal-700"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {title}
            </p>

            <p className="text-xs text-gray-500 mt-1 leading-5">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            handleNotificationToggle(
              settingName
            )
          }
          disabled={
            savingNotification !== null ||
            loadingSettings
          }
          className={`relative shrink-0 w-12 h-7 rounded-full transition ${
            enabled
              ? "bg-teal-700"
              : "bg-gray-300"
          } disabled:opacity-60`}
          aria-label={`Toggle ${title}`}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              enabled
                ? "left-6"
                : "left-1"
            }`}
          />

          {saving && (
            <Loader2
              size={12}
              className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-500 animate-spin"
            />
          )}
        </button>
      </div>
    );
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your account, security, and
              notification preferences.
            </p>
          </div>

          <div className="space-y-6">

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Bell
                    size={20}
                    className="text-teal-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Choose which notifications you
                    want to receive.
                  </p>
                </div>
              </div>

              {loadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2
                    size={26}
                    className="text-teal-700 animate-spin"
                  />

                  <span className="ml-2 text-sm text-gray-500">
                    Loading notification settings...
                  </span>
                </div>
              ) : (
                <div className="space-y-3">

                  <NotificationToggle
                    settingName="emailNotifications"
                    title="Email Notifications"
                    description="Receive important account and system updates by email."
                    icon={Mail}
                  />

                  <NotificationToggle
                    settingName="announcementNotifications"
                    title="Announcements"
                    description="Get notified when new bootcamp announcements are posted."
                    icon={Megaphone}
                  />

                  <NotificationToggle
                    settingName="assignmentNotifications"
                    title="Assignments"
                    description="Receive notifications about new assignments and assignment updates."
                    icon={ClipboardList}
                  />

                </div>
              )}
            </div>

            {/* =================================================
                CHANGE PASSWORD
            ================================================= */}

            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <ShieldCheck
                    size={20}
                    className="text-teal-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Change Password
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Update your password to keep your
                    account secure.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

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
                    value={
                      formData.currentPassword
                    }
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
                    value={
                      formData.newPassword
                    }
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-gray-100"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Password must contain at least 6
                    characters.
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
                    value={
                      formData.confirmPassword
                    }
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
                  {loading
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </form>
            </div>

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