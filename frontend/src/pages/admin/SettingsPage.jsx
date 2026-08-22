import React, { useState } from "react";
import { Save, User, Bell, Lock, Loader, CheckCircle } from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    // Simulate API save
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {saveSuccess && (
        <div className="absolute top-4 right-4 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm font-medium flex items-center shadow-sm">
          <CheckCircle size={16} className="mr-2" />
          Settings saved successfully!
        </div>
      )}

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-4 px-6 text-sm font-medium text-center flex justify-center items-center space-x-2 ${activeTab === "profile" ? "border-b-2 border-teal-600 text-teal-600 bg-gray-50" : "text-gray-500 hover:text-gray-700"}`}
        >
          <User size={18} />
          <span>Profile Settings</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex-1 py-4 px-6 text-sm font-medium text-center flex justify-center items-center space-x-2 ${activeTab === "notifications" ? "border-b-2 border-teal-600 text-teal-600 bg-gray-50" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Bell size={18} />
          <span>Notifications</span>
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-4 px-6 text-sm font-medium text-center flex justify-center items-center space-x-2 ${activeTab === "security" ? "border-b-2 border-teal-600 text-teal-600 bg-gray-50" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Lock size={18} />
          <span>Security</span>
        </button>
      </div>

      <div className="p-8">
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  defaultValue="Student"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  defaultValue="admin@gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+1 234 567 890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  defaultValue="Super Admin"
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
              <button
                disabled={isSaving}
                type="submit"
                className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === "notifications" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive daily summaries via email
                  </p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    New Enrollments
                  </p>
                  <p className="text-xs text-gray-500">
                    Notify when a new student joins a track
                  </p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    System Alerts
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive alerts regarding system maintenance
                  </p>
                </div>
              </label>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => handleSave()}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
              <button
                disabled={isSaving}
                type="submit"
                className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <Lock size={18} />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
