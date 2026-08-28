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
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  Eye,
  MoreVertical,
  BookOpen,
} from "lucide-react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";

const NotificationTypeIcon = ({ type }) => {
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
    case "NEW_PHASE":
      return <Bell className="w-5 h-5 text-purple-600" />;
    case "ANNOUNCEMENT":
      return <Bell className="w-5 h-5 text-orange-600" />;
    case "MENTOR_NEW_ASSIGNMENT":
      return <FileText className="w-5 h-5 text-orange-600" />;
    case "MENTOR_NEW_RESOURCE":
      return <BookOpen className="w-5 h-5 text-green-600" />;
    case "MENTOR_ANNOUNCEMENT":
      return <Bell className="w-5 h-5 text-purple-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

const NotificationTypeLabel = ({ type }) => {
  const labels = {
    APPLICATION_SUBMITTED: "Application Submitted",
    PHASE_APPROVED: "Phase Approved",
    PHASE_REJECTED: "Phase Rejected",
    REGISTRATION_CLOSED: "Registration Closed",
    REGISTRATION_OPENED: "Registration Opened",
    PHASE_SUBMITTED: "Phase Submitted",
    STUDENT_ENROLLMENT: "Student Enrollment",
    MENTOR_ASSIGNMENT: "Mentor Assignment",
    NEW_PHASE: "New Phase",
    ANNOUNCEMENT: "Announcement",
    MENTOR_NEW_ASSIGNMENT: "New Assignment",
    MENTOR_NEW_RESOURCE: "New Resource",
    MENTOR_ANNOUNCEMENT: "Mentor Announcement",
  };
  return labels[type] || type;
};

const getNotificationMessage = (notification) => {
  const { type, message, metadata } = notification;

  if (type === "MENTOR_NEW_ASSIGNMENT") {
    return metadata?.assignmentTitle
      ? `New assignment for ${metadata.batchName}: ${metadata.assignmentTitle}`
      : message;
  }

  if (type === "MENTOR_NEW_RESOURCE") {
    return metadata?.resourceTitle
      ? `New resource for ${metadata.batchName}: ${metadata.resourceTitle}`
      : message;
  }

  if (type === "MENTOR_ANNOUNCEMENT") {
    return metadata?.announcementTitle
      ? `New announcement: ${metadata.announcementTitle}`
      : message;
  }

  if (type === "ANNOUNCEMENT") {
    return metadata?.announcementTitle
      ? `${metadata.author || "Admin"} published: ${metadata.announcementTitle}`
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

const MentorNotificationsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/notifications?page=${page}&limit=20`;
      if (filterType) url += `&type=${filterType}`;
      const response = await API.get(url);
      if (response.data.success) {
        setNotifications(response.data.data);
        setTotalPages(response.data.totalPages);
        setPage(response.data.currentPage);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
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

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filterType]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
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
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await API.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications deleted");
    } catch (error) {
      toast.error("Failed to delete notifications");
    }
  };

  const handleViewDetails = (notification) => {
    navigate("/mentor-dashboard/announcements");
  };

  const filteredNotifications = notifications.filter((n) => {
    const message = getNotificationMessage(n).toLowerCase();
    return message.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay updated with the latest news and updates from your track
            </p>
          </div>
          <NotificationDropdown />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Read</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notifications.length - unreadCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="">All Types</option>
              <option value="APPLICATION_SUBMITTED">Application Submitted</option>
              <option value="PHASE_APPROVED">Phase Approved</option>
              <option value="PHASE_REJECTED">Phase Rejected</option>
              <option value="REGISTRATION_CLOSED">Registration Closed</option>
              <option value="REGISTRATION_OPENED">Registration Opened</option>
              <option value="PHASE_SUBMITTED">Phase Submitted</option>
              <option value="STUDENT_ENROLLMENT">Student Enrollment</option>
              <option value="MENTOR_ASSIGNMENT">Mentor Assignment</option>
              <option value="NEW_PHASE">New Phase</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No notifications found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchQuery ? "Try adjusting your search or filters" : "You're all caught up! No notifications yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      notification.isRead
                        ? "bg-gray-50/50 dark:bg-gray-800/50 opacity-75"
                        : "bg-teal-50/30 dark:bg-teal-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 shrink-0">
                        <NotificationTypeIcon type={notification.type} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                              {NotificationTypeLabel(notification.type)}
                            </h3>
                            <p
                              className={`text-sm leading-relaxed ${
                                notification.isRead
                                  ? "text-gray-600 dark:text-gray-400"
                                  : "text-gray-900 dark:text-white font-medium"
                              }`}
                            >
                              {getNotificationMessage(notification)}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {getNotificationTime(notification.createdAt)}
                              </span>

                              {notification.batch && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium">
                                  {notification.batch.name || "Batch"}
                                </span>
                              )}

                              {notification.metadata?.reviewNotes && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Note:</span> {notification.metadata.reviewNotes}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30 hover:bg-teal-200 dark:hover:bg-teal-900/50 rounded-lg transition-colors"
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDetails(notification)}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNotification(notification._id)}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorNotificationsPage;
