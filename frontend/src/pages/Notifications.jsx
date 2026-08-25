import React, { useEffect, useState } from "react";
import { Bell, Megaphone, FileText, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements");

      const rawAnnouncements =
        response.data?.data ||
        response.data?.announcements ||
        [];

      const announcements = Array.isArray(rawAnnouncements)
        ? rawAnnouncements
        : [];

      const currentUserId = localStorage.getItem("userId");

      const formatted = announcements
        .filter((announcement) => {
          const target = announcement.targetAudience;

          return target === "mentors" || target === "all";
        })
        .map((announcement) => {
          const readBy = announcement.readBy || [];

          const unread =
            currentUserId &&
            !readBy.some(
              (id) =>
                String(id?._id || id) === String(currentUserId)
            );

          return {
            id: announcement._id,
            type: "announcement",
            title: announcement.title || "New Announcement",
            message:
              announcement.content ||
              "You have a new announcement.",
            date:
              announcement.publishDate ||
              announcement.createdAt,
            unread: Boolean(unread),
          };
        });

      setNotifications(formatted);
    } catch (err) {
      console.error("Notifications error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.id) {
        await api.patch(
          `/announcements/${notification.id}/read`
        );
      }
    } catch (err) {
      console.log("Could not mark notification as read");
    }

    navigate("/mentor/announcements");
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8] p-5 lg:p-8">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-7">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Stay updated with announcements and important information.
          </p>
        </div>

        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">

          <RefreshCw
            size={28}
            className="mx-auto text-teal-600 animate-spin"
          />

          <p className="text-sm text-gray-500 mt-3">
            Loading notifications...
          </p>

        </div>
      ) : notifications.length === 0 ? (

        /* EMPTY */

        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center">

            <Bell
              size={28}
              className="text-teal-600"
            />

          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-5">
            You're all caught up
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            There are no notifications for you right now.
          </p>

        </div>
      ) : (

        /* NOTIFICATIONS */

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {notifications.map((notification) => (

            <button
              key={notification.id}
              onClick={() =>
                handleNotificationClick(notification)
              }
              className={`w-full text-left p-5 border-b border-gray-100 hover:bg-gray-50 transition ${
                notification.unread
                  ? "bg-teal-50/40"
                  : "bg-white"
              }`}
            >

              <div className="flex gap-4">

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">

                  {notification.type === "announcement" ? (
                    <Megaphone
                      size={20}
                      className="text-blue-600"
                    />
                  ) : (
                    <FileText
                      size={20}
                      className="text-amber-600"
                    />
                  )}

                </div>

                <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between gap-3">

                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>

                    {notification.unread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
                    )}

                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {notification.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(notification.date)}
                  </p>

                </div>

              </div>

            </button>

          ))}

        </div>
      )}

    </div>
  );
}

export default Notifications;