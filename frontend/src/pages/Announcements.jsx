import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../utils/api";
import {
  Plus,
  X,
  Trash2,
  Search,
  CalendarDays,
  Megaphone,
  Eye,
  Users,
  Clock,
  Loader2,
  Edit3,
  RefreshCw,
} from "lucide-react";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  // =========================================================
  // BATCHES
  // =========================================================

  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);

  // =========================================================
  // FORM
  // =========================================================

  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "students",
    batch: "",
  });

  // =========================================================
  // FETCH ANNOUNCEMENTS
  // =========================================================

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/announcements");

      console.log(
        "Announcements:",
        response.data
      );

      setAnnouncements(
        response.data?.data || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch announcements:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH MENTOR BATCHES
  // =========================================================

  const fetchMentorBatches = async () => {
    try {
      setBatchesLoading(true);

      const response = await API.get(
        "/mentor/batches"
      );

      console.log(
        "Mentor batches:",
        response.data
      );

      setBatches(
        response.data?.data || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch mentor batches:",
        err
      );

      console.error(
        "Batch error response:",
        err.response?.data
      );

      setBatches([]);

      alert(
        err.response?.data?.message ||
          "Failed to load your batches."
      );
    } finally {
      setBatchesLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchAnnouncements();
    fetchMentorBatches();
  }, []);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getDateKey = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    const year = d.getFullYear();
    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getTodayKey = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const addDays = (
    dateKey,
    amount
  ) => {
    const [year, month, day] =
      dateKey
        .split("-")
        .map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    date.setDate(
      date.getDate() + amount
    );

    const newYear =
      date.getFullYear();

    const newMonth = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const newDay = String(
      date.getDate()
    ).padStart(2, "0");

    return `${newYear}-${newMonth}-${newDay}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "Unknown date";
    }

    return d.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    return d.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // FILTER ANNOUNCEMENTS
  // =========================================================

  const filteredAnnouncements =
    useMemo(() => {
      const today = getTodayKey();

      return announcements.filter(
        (announcement) => {
          const searchValue =
            search
              .trim()
              .toLowerCase();

          const matchesSearch =
            !searchValue ||
            announcement.title
              ?.toLowerCase()
              .includes(searchValue) ||
            announcement.content
              ?.toLowerCase()
              .includes(searchValue) ||
            announcement.batch?.name
              ?.toLowerCase()
              .includes(searchValue);

          if (!matchesSearch) {
            return false;
          }

          const announcementDate =
            getDateKey(
              announcement.publishDate
            );

          if (!announcementDate) {
            return false;
          }

          if (
            dateFilter === "all"
          ) {
            return true;
          }

          if (
            dateFilter === "today"
          ) {
            return (
              announcementDate ===
              today
            );
          }

          if (
            dateFilter ===
            "yesterday"
          ) {
            const yesterday =
              addDays(
                today,
                -1
              );

            return (
              announcementDate ===
              yesterday
            );
          }

          if (
            dateFilter ===
            "7days"
          ) {
            const sevenDaysAgo =
              addDays(
                today,
                -6
              );

            return (
              announcementDate >=
                sevenDaysAgo &&
              announcementDate <=
                today
            );
          }

          if (
            dateFilter ===
            "month"
          ) {
            return announcementDate.startsWith(
              today.substring(0, 7)
            );
          }

          if (
            dateFilter ===
            "custom"
          ) {
            if (!customDate) {
              return true;
            }

            return (
              announcementDate ===
              customDate
            );
          }

          return true;
        }
      );
    }, [
      announcements,
      search,
      dateFilter,
      customDate,
    ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalAnnouncements =
    announcements.length;

  const totalViews =
    announcements.reduce(
      (sum, announcement) =>
        sum +
        Number(
          announcement.viewedStudents ||
            0
        ),
      0
    );

  const totalStudents =
    announcements.reduce(
      (max, announcement) =>
        Math.max(
          max,
          Number(
            announcement.totalStudents ||
              0
          )
        ),
      0
    );

  const averageViewPercentage =
    announcements.length > 0
      ? Math.round(
          announcements.reduce(
            (
              sum,
              announcement
            ) =>
              sum +
              Number(
                announcement.viewPercentage ||
                  0
              ),
            0
          ) /
            announcements.length
        )
      : 0;

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleChange = (e) => {
    setFormData(
      (prev) => ({
        ...prev,
        [e.target.name]:
          e.target.value,
      })
    );
  };

  const openCreateForm = () => {
    setEditingAnnouncement(null);

    setFormData({
      title: "",
      content: "",
      targetAudience:
        "students",
      batch: "",
    });

    // Refresh batches when opening
    // the form
    fetchMentorBatches();

    setShowForm(true);
  };

  const openEditForm = (
    announcement
  ) => {
    setEditingAnnouncement(
      announcement
    );

    setFormData({
      title:
        announcement.title ||
        "",
      content:
        announcement.content ||
        "",
      targetAudience:
        announcement.targetAudience ||
        "students",
      batch:
        announcement.batch?._id ||
        "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);
    setEditingAnnouncement(null);

    setFormData({
      title: "",
      content: "",
      targetAudience:
        "students",
      batch: "",
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert(
        "Please enter a title."
      );
      return;
    }

    if (!formData.content.trim()) {
      alert(
        "Please enter announcement content."
      );
      return;
    }

    if (
      !editingAnnouncement &&
      !formData.batch
    ) {
      alert(
        "Please select a batch."
      );
      return;
    }

    try {
      setSubmitting(true);

      if (editingAnnouncement) {
        await API.put(
          `/announcements/${editingAnnouncement._id}`,
          {
            title:
              formData.title.trim(),
            content:
              formData.content.trim(),
            targetAudience:
              formData.targetAudience,
          }
        );
      } else {
        await API.post(
          "/announcements",
          {
            title:
              formData.title.trim(),
            content:
              formData.content.trim(),
            targetAudience:
              formData.targetAudience,
            batch:
              formData.batch,
          }
        );
      }

      closeForm();

      await fetchAnnouncements();
    } catch (err) {
      console.error(
        "Announcement submission error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
          "Failed to save announcement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this announcement?"
      );

    if (!confirmed) return;

    try {
      await API.delete(
        `/announcements/${id}`
      );

      setAnnouncements(
        (prev) =>
          prev.filter(
            (announcement) =>
              announcement._id !== id
          )
      );
    } catch (err) {
      console.error(
        "Delete announcement error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete announcement."
      );
    }
  };

  // =========================================================
  // FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setDateFilter("all");
    setCustomDate("");
  };

  // =========================================================
  // AUDIENCE LABEL
  // =========================================================

  const getAudienceLabel = (
    audience
  ) => {
    if (audience === "all") {
      return "Everyone";
    }

    if (
      audience === "students"
    ) {
      return "All Students";
    }

    return "Students";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
              <Megaphone
                size={23}
                className="text-teal-700"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Announcements
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Share important updates
                with your students.
              </p>
            </div>

          </div>

          <div className="flex gap-3">

            <button
              onClick={
                fetchAnnouncements
              }
              disabled={loading}
              className="w-11 h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-teal-700 hover:bg-teal-50 transition"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <button
              onClick={
                openCreateForm
              }
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-sm transition"
            >
              <Plus size={18} />

              New Announcement
            </button>

          </div>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Total Announcements
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalAnnouncements}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                <Megaphone
                  size={21}
                  className="text-teal-600"
                />
              </div>

            </div>

          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Student Views
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalViews}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Eye
                  size={21}
                  className="text-blue-600"
                />
              </div>

            </div>

          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Students Reached
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalStudents}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users
                  size={21}
                  className="text-purple-600"
                />
              </div>

            </div>

          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Average View Rate
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {averageViewPercentage}%
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <Eye
                  size={21}
                  className="text-green-600"
                />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

          <div className="flex flex-col xl:flex-row gap-4">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              />

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <div className="relative">

                <CalendarDays
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />

                <select
                  value={dateFilter}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setDateFilter(
                      value
                    );

                    if (
                      value !==
                      "custom"
                    ) {
                      setCustomDate(
                        ""
                      );
                    }
                  }}
                  className="w-full sm:w-52 pl-10 pr-9 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">
                    All Dates
                  </option>

                  <option value="today">
                    Today
                  </option>

                  <option value="yesterday">
                    Yesterday
                  </option>

                  <option value="7days">
                    Last 7 Days
                  </option>

                  <option value="month">
                    This Month
                  </option>

                  <option value="custom">
                    Specific Date
                  </option>
                </select>

              </div>

              {dateFilter ===
                "custom" && (
                <input
                  type="date"
                  value={
                    customDate
                  }
                  max={getTodayKey()}
                  onChange={(e) =>
                    setCustomDate(
                      e.target.value
                    )
                  }
                  className="w-full sm:w-48 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
                />
              )}

            </div>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-100">

            <p className="text-sm text-gray-500">

              Showing{" "}

              <span className="font-semibold text-gray-800">
                {
                  filteredAnnouncements.length
                }
              </span>{" "}

              of{" "}

              <span className="font-semibold text-gray-800">
                {
                  announcements.length
                }
              </span>{" "}

              announcements

            </p>

            {(search ||
              dateFilter !==
                "all" ||
              customDate) && (
              <button
                onClick={
                  clearFilters
                }
                className="text-sm text-teal-700 hover:text-teal-900 font-medium"
              >
                Clear Filters
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* =================================================
            ANNOUNCEMENTS
        ================================================= */}

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center">

            <Loader2
              size={30}
              className="text-teal-600 animate-spin"
            />

            <p className="text-sm text-gray-500 mt-3">
              Loading announcements...
            </p>

          </div>
        ) : filteredAnnouncements.length >
          0 ? (
          <div className="space-y-4">

            {filteredAnnouncements.map(
              (item) => {
                const percentage =
                  Math.min(
                    Number(
                      item.viewPercentage ||
                        0
                    ),
                    100
                  );

                return (
                  <div
                    key={
                      item._id
                    }
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
                  >

                    <div className="p-5 md:p-6">

                      <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                        <div className="flex gap-4">

                          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">

                            <Megaphone
                              size={20}
                              className="text-teal-700"
                            />

                          </div>

                          <div className="min-w-0">

                            <h3 className="font-semibold text-gray-900 text-lg">
                              {
                                item.title
                              }
                            </h3>

                            <p className="text-sm text-gray-600 mt-2 leading-6">
                              {
                                item.content
                              }
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-4">

                              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 px-2.5 py-1.5 rounded-full">

                                <Users
                                  size={13}
                                />

                                {getAudienceLabel(
                                  item.targetAudience
                                )}

                              </span>

                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">

                                <CalendarDays
                                  size={14}
                                />

                                {formatDate(
                                  item.publishDate
                                )}

                              </span>

                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">

                                <Clock
                                  size={14}
                                />

                                {formatTime(
                                  item.publishDate
                                )}

                              </span>

                              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1.5 rounded-full">

                                {item.batch?.name ||
                                  "No batch"}

                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="flex items-center gap-2 self-end lg:self-start">

                          <button
                            onClick={() =>
                              openEditForm(
                                item
                              )
                            }
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition"
                            title="Edit"
                          >
                            <Edit3
                              size={
                                17
                              }
                            />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                item._id
                              )
                            }
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2
                              size={
                                17
                              }
                            />
                          </button>

                        </div>

                      </div>

                      <div className="mt-5 pt-5 border-t border-gray-100">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                          <div className="flex items-center gap-7">

                            <div>

                              <p className="text-xs text-gray-400">
                                Student Views
                              </p>

                              <p className="text-sm font-semibold text-gray-800 mt-1">

                                {
                                  item.viewedStudents ||
                                    0
                                }{" "}

                                /{" "}

                                {
                                  item.totalStudents ||
                                    0
                                }

                              </p>

                            </div>

                            <div>

                              <p className="text-xs text-gray-400">
                                View Rate
                              </p>

                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {
                                  percentage
                                }%
                              </p>

                            </div>

                          </div>

                          <div className="w-full sm:w-64">

                            <div className="flex justify-between text-xs text-gray-400 mb-1.5">

                              <span>
                                Student engagement
                              </span>

                              <span>
                                {
                                  percentage
                                }%
                              </span>

                            </div>

                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">

                              <div
                                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">

            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">

              <Megaphone
                size={24}
                className="text-gray-400"
              />

            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              No announcements found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Try changing your
              search or date filter.
            </p>

            {(search ||
              dateFilter !==
                "all" ||
              customDate) && (
              <button
                onClick={
                  clearFilters
                }
                className="mt-4 text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                Clear Filters
              </button>
            )}

          </div>
        )}

        {/* =================================================
            CREATE / EDIT FORM
        ================================================= */}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

              {/* HEADER */}

              <div className="flex items-center justify-between p-6 border-b border-gray-100">

                <div>

                  <h3 className="font-bold text-gray-900 text-lg">

                    {editingAnnouncement
                      ? "Edit Announcement"
                      : "New Announcement"}

                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Share an important
                    update with your
                    students.
                  </p>

                </div>

                <button
                  onClick={
                    closeForm
                  }
                  disabled={
                    submitting
                  }
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                >

                  <X
                    size={19}
                    className="text-gray-500"
                  />

                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="p-6 space-y-5"
              >

                {/* TITLE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="Enter announcement title"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

                {/* CONTENT */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>

                  <textarea
                    name="content"
                    placeholder="Write your announcement..."
                    rows={5}
                    value={
                      formData.content
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />

                </div>

                {/* TARGET AUDIENCE */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>

                  <select
                    name="targetAudience"
                    value={
                      formData.targetAudience
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  >

                    <option value="students">
                      All Students
                    </option>

                    <option value="all">
                      Everyone
                    </option>

                  </select>

                </div>

                {/* BATCH */}

                {!editingAnnouncement && (
                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch
                    </label>

                    <select
                      name="batch"
                      value={
                        formData.batch
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        batchesLoading
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >

                      <option value="">
                        {batchesLoading
                          ? "Loading your batches..."
                          : batches.length ===
                              0
                            ? "No batches assigned"
                            : "Select a batch"}
                      </option>

                      {batches.map(
                        (batch) => (
                          <option
                            key={
                              batch._id
                            }
                            value={
                              batch._id
                            }
                          >
                            {batch.name}

                            {batch.track
                              ? ` — ${batch.track}`
                              : ""}
                          </option>
                        )
                      )}

                    </select>

                    <p className="text-xs text-gray-400 mt-2">
                      Only batches assigned
                      to you are shown.
                    </p>

                    {batches.length ===
                      0 &&
                      !batchesLoading && (
                        <p className="text-xs text-red-500 mt-2">
                          No batch is assigned
                          to your mentor
                          account.
                        </p>
                      )}

                  </div>
                )}

                {/* EDIT BATCH INFO */}

                {editingAnnouncement && (
                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch
                    </label>

                    <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-600">
                      {editingAnnouncement
                        .batch?.name ||
                        "No batch"}
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      The batch cannot be changed
                      while editing an announcement.
                    </p>

                  </div>
                )}

                {/* BUTTONS */}

                <div className="flex gap-3 pt-2">

                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    disabled={
                      submitting
                    }
                    className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      batchesLoading ||
                      (!editingAnnouncement &&
                        batches.length ===
                          0)
                    }
                    className="flex-1 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  >

                    {submitting && (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    )}

                    {editingAnnouncement
                      ? "Save Changes"
                      : "Publish Announcement"}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default Announcements;