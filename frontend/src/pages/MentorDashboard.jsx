import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  CalendarDays,
  Users,
  TrendingUp,
  FileText,
  Star,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  MoreHorizontal,
  Megaphone,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";

import Sidebar from "../components/mentor/Sidebar";
import AttendanceChart from "../components/mentor/AttendanceChart";
import StudentsAtRisk from "../components/mentor/StudentsAtRisk";
import RecentAssignments from "../components/mentor/RecentAssignments";

import api from "../utils/api";

/* =========================================================
   CIRCULAR PROGRESS
========================================================= */

function CircularProgress({
  percentage = 0,
  label,
  subtitle,
}) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;

  const safePercentage = Math.min(
    Math.max(Number(percentage) || 0, 0),
    100
  );

  const offset =
    circumference -
    (safePercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg
          className="w-32 h-32 -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#0F766E"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {safePercentage}%
          </span>

          <span className="text-[10px] uppercase tracking-wider text-gray-400">
            Score
          </span>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm font-semibold text-gray-900">
          {label}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  iconBg,
  iconColor,
  title,
  value,
  subtitle,
  badge,
}) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <span className={iconColor}>
            {icon}
          </span>
        </div>

        {badge && (
          <span className="text-[11px] font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-5">
        {title}
      </p>

      <h2 className="text-3xl font-bold text-gray-900 mt-1">
        {value}
      </h2>

      <p className="text-xs text-gray-400 mt-1">
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

function QuickActions({ navigate }) {
  return (
    <div className="p-6">
      <div className="space-y-3">

        <button
          onClick={() =>
            navigate("/mentor/attendance")
          }
          className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <CalendarDays
                size={19}
                className="text-teal-700"
              />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                Mark Attendance
              </p>

              <p className="text-xs text-gray-400 mt-0.5">
                Record today's attendance
              </p>
            </div>
          </div>

          <ChevronRight
            size={17}
            className="text-gray-300 group-hover:text-teal-600 transition"
          />
        </button>

        <button
          onClick={() =>
            navigate("/mentor/grading")
          }
          className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileText
                size={19}
                className="text-amber-600"
              />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                Review Submissions
              </p>

              <p className="text-xs text-gray-400 mt-0.5">
                Grade student assignments
              </p>
            </div>
          </div>

          <ChevronRight
            size={17}
            className="text-gray-300 group-hover:text-amber-600 transition"
          />
        </button>

        <button
          onClick={() =>
            navigate("/mentor/announcements")
          }
          className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Bell
                size={19}
                className="text-blue-600"
              />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                Create Announcement
              </p>

              <p className="text-xs text-gray-400 mt-0.5">
                Send an announcement to students
              </p>
            </div>
          </div>

          <ChevronRight
            size={17}
            className="text-gray-300 group-hover:text-blue-600 transition"
          />
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION DROPDOWN
========================================================= */

function NotificationDropdown({
  notifications,
  onClose,
  onRead,
  onRefresh,
  loading,
  navigate,
}) {
  const getNotificationIcon = (type) => {
    if (type === "announcement") {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Megaphone
            size={18}
            className="text-blue-600"
          />
        </div>
      );
    }

    if (type === "assignment") {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <FileText
            size={18}
            className="text-amber-600"
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        <Bell
          size={18}
          className="text-gray-600"
        />
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleNotificationClick = async (notification) => {
    if (
      notification.type === "announcement" &&
      notification.id
    ) {
      await onRead(notification.id);
    }

    onClose();

    if (notification.type === "announcement") {
      navigate("/mentor/announcements");
    } else if (
      notification.type === "assignment"
    ) {
      navigate("/mentor/grading");
    }
  };

  return (
    <div className="absolute right-0 top-14 z-50 w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

      {/* HEADER */}

      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">
            Notifications
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Important updates for you
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            title="Refresh notifications"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin text-teal-600"
                  : "text-gray-500"
              }
            />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <X
              size={16}
              className="text-gray-500"
            />
          </button>
        </div>
      </div>

      {/* BODY */}

      <div className="max-h-[420px] overflow-y-auto">

        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw
              size={24}
              className="mx-auto text-teal-600 animate-spin"
            />

            <p className="text-sm text-gray-500 mt-3">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center">
              <CheckCircle2
                size={26}
                className="text-teal-600"
              />
            </div>

            <h4 className="font-semibold text-gray-900 mt-4">
              You're all caught up
            </h4>

            <p className="text-xs text-gray-500 mt-1">
              There are no new notifications.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.key}
              type="button"
              onClick={() =>
                handleNotificationClick(
                  notification
                )
              }
              className={`w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition ${
                notification.unread
                  ? "bg-teal-50/40"
                  : "bg-white"
              }`}
            >
              <div className="flex gap-3">
                {getNotificationIcon(
                  notification.type
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {notification.title}
                    </p>

                    {notification.unread && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">
                      {formatDate(
                        notification.date
                      )}
                    </span>

                    <span className="text-[11px] text-teal-600 font-medium flex items-center gap-1">
                      View
                      <ExternalLink size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* FOOTER */}

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("/mentor/notifications");
          }}
          className="w-full text-center text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MENTOR DASHBOARD
========================================================= */

function MentorDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const notificationRef = useRef(null);

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/mentor/dashboard"
      );

      console.log(
        "Mentor dashboard:",
        response.data
      );

      if (response.data?.success) {
        setDashboard(
          response.data.data
        );
      } else {
        setError(
          response.data?.message ||
            "Failed to load dashboard"
        );
      }
    } catch (err) {
      console.error(
        "Mentor dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FETCH NOTIFICATIONS
  ======================================================= */

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      /*
       * We use the existing announcement endpoint.
       *
       * If your backend endpoint is different, change only
       * this URL.
       */

      const response = await api.get(
        "/announcements"
      );

      const rawAnnouncements =
        response.data?.data ||
        response.data?.announcements ||
        [];

      const announcements =
        Array.isArray(rawAnnouncements)
          ? rawAnnouncements
          : [];

      const announcementNotifications =
        announcements
          .filter((announcement) => {
            const target =
              announcement.targetAudience;

            return (
              target === "mentors" ||
              target === "all"
            );
          })
          .slice(0, 10)
          .map((announcement) => {
            const readBy =
              announcement.readBy || [];

            const currentUserId =
              localStorage.getItem(
                "userId"
              );

            const unread =
              currentUserId &&
              !readBy.some(
                (id) =>
                  String(
                    id?._id || id
                  ) ===
                  String(
                    currentUserId
                  )
              );

            return {
              key: `announcement-${announcement._id}`,
              id: announcement._id,
              type: "announcement",
              title:
                announcement.title ||
                "New Announcement",
              message:
                announcement.content ||
                "You have a new announcement.",
              date:
                announcement.publishDate ||
                announcement.createdAt,
              unread: Boolean(unread),
            };
          });

      /*
       * Pending submissions from dashboard
       * are also useful as notifications.
       */

      const pending =
        dashboard?.pendingGrading || [];

      const assignmentNotifications =
        pending.slice(0, 10).map(
          (submission, index) => ({
            key: `assignment-${submission._id || index}`,
            id: submission._id,
            type: "assignment",
            title:
              submission.assignment?.title ||
              submission.title ||
              "Assignment needs review",
            message:
              submission.student?.name
                ? `${submission.student.name} submitted an assignment for review.`
                : "A student submission is waiting for your review.",
            date:
              submission.createdAt ||
              submission.submittedAt,
            unread: true,
          })
        );

      const combined = [
        ...announcementNotifications,
        ...assignmentNotifications,
      ];

      combined.sort((a, b) => {
        const dateA = new Date(
          a.date || 0
        ).getTime();

        const dateB = new Date(
          b.date || 0
        ).getTime();

        return dateB - dateA;
      });

      setNotifications(
        combined.slice(0, 15)
      );
    } catch (err) {
      console.error(
        "Notifications error:",
        err
      );

      /*
       * Do not break the dashboard if the
       * notification endpoint is unavailable.
       */

      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  /* =======================================================
     MARK ANNOUNCEMENT AS READ
  ======================================================= */

  const markAnnouncementAsRead = async (
    announcementId
  ) => {
    try {
      /*
       * This expects a backend route such as:
       *
       * PATCH /api/announcements/:id/read
       *
       * If your announcement controller does not
       * have this yet, we can add it next.
       */

      await api.patch(
        `/announcements/${announcementId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id ===
            announcementId
            ? {
                ...notification,
                unread: false,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      /*
       * Update locally even if the backend
       * read endpoint is not available yet.
       */

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id ===
            announcementId
            ? {
                ...notification,
                unread: false,
              }
            : notification
        )
      );
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /*
   * Fetch notifications after dashboard data
   * is available.
   */

  useEffect(() => {
    if (!loading) {
      fetchNotifications();
    }
  }, [loading]);

  /* =======================================================
     CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F4F7F8]">
        <Sidebar />

        <main className="flex-1 p-5 lg:p-8">
          <div className="animate-pulse space-y-6">

            <div className="h-48 bg-gray-200 rounded-3xl" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="h-36 bg-gray-200 rounded-2xl" />
              <div className="h-36 bg-gray-200 rounded-2xl" />
              <div className="h-36 bg-gray-200 rounded-2xl" />
              <div className="h-36 bg-gray-200 rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
            </div>

          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F4F7F8]">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md">

            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle
                size={26}
                className="text-red-500"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-4">
              Dashboard couldn't load
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {error}
            </p>

            <button
              onClick={fetchDashboard}
              className="mt-5 px-5 py-2.5 bg-teal-700 text-white rounded-xl text-sm font-semibold hover:bg-teal-800 transition"
            >
              Try Again
            </button>

          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     DATABASE DATA
  ======================================================= */

  const studentsCount =
    dashboard?.studentsCount || 0;

  const attendancePercentage =
    Number(
      dashboard?.attendancePercentage || 0
    );

  const pendingSubmissions =
    dashboard?.pendingSubmissions || 0;

  const averageGrade =
    Number(
      dashboard?.averageGrade || 0
    );

  const studentsAtRisk =
    dashboard?.studentsAtRisk || [];

  const pendingGrading =
    dashboard?.pendingGrading || [];

  const mentorName =
    dashboard?.mentor?.name ||
    dashboard?.mentorName ||
    dashboard?.user?.name ||
    "Mentor";

  const attendanceChartData =
    dashboard?.attendanceChart ||
    dashboard?.attendanceHistory ||
    [];

  /* =======================================================
     NOTIFICATION COUNT
  ======================================================= */

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        notification.unread
    ).length;

  /* =======================================================
     DATE
  ======================================================= */

  const today =
    new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

  /* =======================================================
     ATTENDANCE STATUS
  ======================================================= */

  const healthyAttendance =
    attendancePercentage >= 80;

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-[#F4F7F8]">

      <Sidebar />

      <main className="flex-1 min-w-0 p-5 lg:p-8 overflow-y-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="relative overflow-visible rounded-3xl bg-gradient-to-br from-[#0F5257] via-[#12676B] to-[#16858A] p-6 lg:p-8 mb-7 shadow-lg">

          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

          <div className="absolute right-32 -bottom-40 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            {/* WELCOME */}

            <div>
              <div className="flex items-center gap-2 mb-3">

                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-medium">
                  Mentor Portal
                </span>

                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />

                <span className="text-xs text-white/70">
                  Online
                </span>

              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Good morning, {mentorName} 👋
              </h1>

              <p className="text-white/70 mt-2 text-sm lg:text-base">
                Here's what's happening with your students today.
              </p>
            </div>

            {/* DATE + NOTIFICATION */}

            <div className="flex items-center gap-3">

              <div className="hidden sm:flex items-center gap-3 bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3 rounded-2xl">

                <CalendarDays
                  size={18}
                  className="text-white"
                />

                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">
                    Today
                  </p>

                  <p className="text-sm font-medium text-white">
                    {today}
                  </p>
                </div>

              </div>

              {/* NOTIFICATION */}

              <div
                ref={notificationRef}
                className="relative"
              >
                <button
                  onClick={() =>
                    setNotificationOpen(
                      (previous) =>
                        !previous
                    )
                  }
                  className="relative p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition"
                >
                  <Bell
                    size={20}
                    className="text-white"
                  />

                  {unreadNotifications >
                    0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#12676B]">
                      {unreadNotifications >
                      9
                        ? "9+"
                        : unreadNotifications}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <NotificationDropdown
                    notifications={
                      notifications
                    }
                    onClose={() =>
                      setNotificationOpen(
                        false
                      )
                    }
                    onRead={
                      markAnnouncementAsRead
                    }
                    onRefresh={
                      fetchNotifications
                    }
                    loading={
                      notificationsLoading
                    }
                    navigate={navigate}
                  />
                )}
              </div>

            </div>

          </div>
        </section>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

          <StatCard
            icon={<Users size={21} />}
            iconBg="bg-teal-50"
            iconColor="text-teal-700"
            title="My Students"
            value={studentsCount}
            subtitle="Total active students"
          />

          <StatCard
            icon={<TrendingUp size={21} />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Attendance"
            value={`${attendancePercentage}%`}
            subtitle="Average attendance"
            badge="Current period"
          />

          <StatCard
            icon={<FileText size={21} />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            title="Pending Submissions"
            value={pendingSubmissions}
            subtitle="Assignments waiting for review"
            badge={
              pendingSubmissions > 0
                ? "Needs attention"
                : "All clear"
            }
          />

          <StatCard
            icon={<Star size={21} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title="Average Grade"
            value={`${averageGrade}%`}
            subtitle="Across your current track"
          />

        </section>

        {/* =================================================
            PERFORMANCE
        ================================================= */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-start justify-between mb-5">

              <div>
                <h2 className="font-bold text-gray-900">
                  Attendance Score
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Current student attendance
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/mentor/attendance"
                  )
                }
                className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                <MoreHorizontal
                  size={18}
                  className="text-gray-400"
                />
              </button>

            </div>

            <CircularProgress
              percentage={
                attendancePercentage
              }
              label={
                healthyAttendance
                  ? "Healthy attendance"
                  : "Needs attention"
              }
              subtitle={
                healthyAttendance
                  ? "Above the 80% target"
                  : "Below the 80% target"
              }
            />

            <div className="grid grid-cols-2 gap-3 mt-6">

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Current
                </p>

                <p className="text-lg font-bold text-gray-900 mt-1">
                  {attendancePercentage}%
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Target
                </p>

                <p className="text-lg font-bold text-gray-900 mt-1">
                  80%
                </p>
              </div>

            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <AttendanceChart
              data={attendanceChartData}
            />

          </div>

        </section>

        {/* =================================================
            STUDENTS AT RISK + ASSIGNMENTS
        ================================================= */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <StudentsAtRisk
              students={studentsAtRisk}
            />

          </div>

          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <RecentAssignments
              submissions={pendingGrading}
            />

          </div>

        </section>

        {/* =================================================
            QUICK ACTIONS + TODAY'S FOCUS
        ================================================= */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-6 pt-6">

              <h2 className="font-bold text-gray-900">
                Quick Actions
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Common mentor tasks
              </p>

            </div>

            <QuickActions
              navigate={navigate}
            />

          </div>

          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F5257] to-[#16858A] p-7 shadow-lg text-white">

            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/5" />

            <div className="relative">

              <div className="flex items-center gap-2 mb-4">

                <Clock3 size={17} />

                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Today's Focus
                </span>

              </div>

              <h2 className="text-2xl font-bold">
                Keep your students moving forward 🚀
              </h2>

              <p className="text-sm text-white/70 mt-2 max-w-xl">
                Review submissions, monitor attendance, and support students who need additional help.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">

                <button
                  onClick={() =>
                    navigate(
                      "/mentor/grading"
                    )
                  }
                  className="bg-white text-teal-800 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition flex items-center gap-2"
                >
                  Review submissions
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/mentor/students"
                    )
                  }
                  className="bg-white/10 border border-white/20 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition"
                >
                  View students
                </button>

              </div>

              <div className="flex flex-wrap gap-6 mt-7 pt-5 border-t border-white/10">

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    size={16}
                    className="text-emerald-300"
                  />

                  <span className="text-xs text-white/70">
                    System operational
                  </span>

                </div>

                {pendingSubmissions >
                  0 && (
                  <div className="flex items-center gap-2">

                    <AlertTriangle
                      size={16}
                      className="text-amber-300"
                    />

                    <span className="text-xs text-white/70">
                      {pendingSubmissions}{" "}
                      submissions need review
                    </span>

                  </div>
                )}

                {studentsAtRisk.length >
                  0 && (
                  <div className="flex items-center gap-2">

                    <AlertTriangle
                      size={16}
                      className="text-red-300"
                    />

                    <span className="text-xs text-white/70">
                      {
                        studentsAtRisk.length
                      }{" "}
                      student
                      {studentsAtRisk.length !==
                      1
                        ? "s"
                        : ""}{" "}
                      need attention
                    </span>

                  </div>
                )}

              </div>

            </div>

          </div>

        </section>

        <div className="h-10" />

      </main>
    </div>
  );
}

export default MentorDashboard;