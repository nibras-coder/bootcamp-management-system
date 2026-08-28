import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  FileText,
  Check,
  ArrowRight,
  MoreVertical,
  ChevronLeft,
  BookOpen,
} from "lucide-react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await API.get(`/notifications?page=${page}&limit=10&isRead=false`);
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get("/notifications/unread-count");
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleNavigateToApplication = (applicationId) => {
    navigate(`/apply?app=${applicationId}`);
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "APPLICATION_SUBMITTED":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "PHASE_APPROVED":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "PHASE_REJECTED":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "REGISTRATION_CLOSED":
        return <Lock className="w-5 h-5 text-red-600" />;
      case "REGISTRATION_OPENED":
        return <Check className="w-5 h-5 text-green-600" />;
      case "PHASE_SUBMITTED":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "STUDENT_ENROLLMENT":
        return <CheckCircle2 className="w-5 h-5 text-teal-600" />;
      case "MENTOR_ASSIGNMENT":
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case "ASSIGNMENT_CREATED":
        return <FileText className="w-5 h-5 text-purple-600" />;
      case "MENTOR_NEW_ASSIGNMENT":
        return <FileText className="w-5 h-5 text-orange-600" />;
      case "RESOURCE_ADDED":
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case "MENTOR_NEW_RESOURCE":
        return <BookOpen className="w-5 h-5 text-green-600" />;
      case "ANNOUNCEMENT":
        return <Bell className="w-5 h-5 text-orange-600" />;
      case "MENTOR_ANNOUNCEMENT":
        return <Bell className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, message, metadata } = notification;

    if (type === "APPLICATION_SUBMITTED") {
      return metadata?.studentName
        ? `${metadata.studentName} submitted application for ${metadata.batchName}`
        : message;
    }

    if (type === "PHASE_APPROVED") {
      return metadata?.batchName
        ? `Your submission for ${metadata.batchName} has been approved!`
        : message;
    }

    if (type === "PHASE_REJECTED") {
      return metadata?.batchName
        ? `Your submission for ${metadata.batchName} has been rejected`
        : message;
    }

    if (type === "REGISTRATION_CLOSED") {
      return metadata?.batchName
        ? `Registration for ${metadata.batchName} has been closed`
        : message;
    }

    if (type === "REGISTRATION_OPENED") {
      return metadata?.batchName
        ? `Registration for ${metadata.batchName} has been reopened`
        : message;
    }

    if (type === "PHASE_SUBMITTED") {
      return message;
    }

    if (type === "ASSIGNMENT_CREATED") {
      return metadata?.assignmentTitle
        ? `${metadata.createdBy || "An admin"} created a new assignment: ${metadata.assignmentTitle}`
        : message;
    }

    if (type === "MENTOR_NEW_ASSIGNMENT") {
      return metadata?.assignmentTitle
        ? `New assignment for ${metadata.batchName}: ${metadata.assignmentTitle}`
        : message;
    }

    if (type === "RESOURCE_ADDED") {
      return metadata?.resourceTitle
        ? `${metadata.uploadedBy || "An admin"} uploaded a new resource: ${metadata.resourceTitle}`
        : message;
    }

    if (type === "MENTOR_NEW_RESOURCE") {
      return metadata?.resourceTitle
        ? `New resource for ${metadata.batchName}: ${metadata.resourceTitle}`
        : message;
    }

    if (type === "ANNOUNCEMENT") {
      return metadata?.announcementTitle
        ? `${metadata.author || "Admin"} published: ${metadata.announcementTitle}`
        : message;
    }

    if (type === "MENTOR_ANNOUNCEMENT") {
      return metadata?.announcementTitle
        ? `New announcement: ${metadata.announcementTitle}`
        : message;
    }

    return message;
  };

  const getNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-full">
                    {unreadCount} Unread
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg transition-colors ${
                      notification.isRead
                        ? "bg-gray-50 dark:bg-gray-800/50 opacity-70"
                        : "bg-teal-50/50 dark:bg-teal-900/20 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            notification.isRead
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-gray-900 dark:text-white font-medium"
                          }`}
                        >
                          {getNotificationMessage(notification)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {getNotificationTime(notification.createdAt)}
                          </span>
                          {notification.batch && (
                            <span className="text-xs text-teal-600 dark:text-teal-400">
                              {notification.batch.name || "Batch"}
                            </span>
                          )}
                        </div>
                        {notification.metadata?.reviewNotes && (
                          <div className="mt-2 p-2 rounded bg-gray-100 dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Note:</span> {notification.metadata.reviewNotes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs text-teal-600 dark:text-teal-400 font-semibold"
                          >
                            Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-xs text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => navigate("/announcements")}
                className="w-full py-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                View All Notifications <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;