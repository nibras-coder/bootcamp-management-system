import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Megaphone,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";

const navItems = [
  { path: "/student-dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    path: "/student-dashboard/attendance",
    label: "My Attendance",
    icon: CalendarCheck2,
  },
  {
    path: "/student-dashboard/progress",
    label: "My Progress",
    icon: GraduationCap,
  },
  {
    path: "/student-dashboard/assignments",
    label: "Assignments",
    icon: FileText,
  },
  { path: "/student-dashboard/grades", label: "Grades", icon: GraduationCap },
  { path: "/apply", label: "Admissions", icon: Sparkles },
  {
    path: "/student-dashboard/announcements",
    label: "Announcements",
    icon: Megaphone,
  },
  { path: "/student-dashboard/profile", label: "Profile", icon: UserRound },
  { path: "/student-dashboard/settings", label: "Settings", icon: Settings },
];

const getTheme = () => localStorage.getItem("theme") || "light";

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StudentSidebar({ mobileOpen, onClose, collapsed, onCollapse, isAdmitted }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const visibleNavItems = navItems.filter((item) => {
    if (isAdmitted) return true; // Show all if admitted
    // If not admitted, only show Dashboard, Admissions, Profile, Settings
    return ["/student-dashboard", "/apply", "/student-dashboard/profile", "/student-dashboard/settings"].includes(item.path);
  });

  return (
    <>
      {mobileOpen && (
        <button
          className="student-sidebar-backdrop"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`student-sidebar ${mobileOpen ? "mobile-open" : ""} ${collapsed ? "collapsed" : ""}`}
      >
        <div className="student-brand">
          <div className="student-brand-mark">
            <GraduationCap size={24} />
          </div>
          {!collapsed && (
            <div>
              <strong>ASTU MSJ</strong>
              <span>Bootcamp System</span>
            </div>
          )}
          <button
            className="student-mobile-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="student-nav">
          {visibleNavItems.map(({ path, label, icon: Icon }) => {
            const active =
              path === "/student-dashboard"
                ? location.pathname === path
                : location.pathname.startsWith(path);
            return (
              <button
                key={path}
                type="button"
                className={`student-nav-item ${active ? "active" : ""}`}
                title={collapsed ? label : undefined}
                onClick={() => {
                  navigate(path);
                  onClose();
                }}
              >
                <Icon size={19} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="student-sidebar-bottom">
          <div className="student-user-card">
            <div className="student-user-mini">
              <div className="student-avatar small">
                {(user.name || "S").charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="student-user-mini-text">
                  <strong>{user.name || "Student"}</strong>
                  <span>Student</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="student-logout-btn"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={16} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>

          <button
            type="button"
            className="student-collapse"
            onClick={onCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            {!collapsed && <span>Collapse menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function StatCard({ title, value, label, icon: Icon, tone }) {
  return (
    <div className="student-stat-card">
      <div className={`student-stat-icon ${tone}`}>
        <Icon size={25} />
      </div>
      <div className="student-stat-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

function SectionCard({ title, action, children, className = "" }) {
  return (
    <section className={`student-card ${className}`}>
      <div className="student-card-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ text }) {
  return <div className="student-empty">{text}</div>;
}

export default function StudentDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("studentSidebarCollapsed") === "true",
  );
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    githubUrl: "",
    liveDemoUrl: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    [],
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    document.body.classList.add("student-app-body");
    return () => document.body.classList.remove("student-app-body");
  }, []);

  useEffect(() => {
    localStorage.setItem("studentSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await API.get("/student/dashboard");
        const payload = response.data?.data || response.data;
        setData(payload);
        if (payload.student) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              id: payload.student._id || payload.student.id,
              name: payload.student.name,
              email: payload.student.email,
              role: payload.student.role,
            }),
          );
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
        setError(
          err.response?.data?.message || "Unable to load your dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate, user]);

  const refresh = async () => {
    const response = await API.get("/student/dashboard");
    setData(response.data?.data || response.data);
  };

  const submitAssignment = async (event) => {
    event.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      await API.post("/submissions", {
        assignment: selectedAssignment._id,
        githubUrl: submitForm.githubUrl,
        liveDemoUrl: submitForm.liveDemoUrl,
        notes: submitForm.notes,
      });
      setSelectedAssignment(null);
      setSubmitForm({ githubUrl: "", liveDemoUrl: "", notes: "" });
      toast.success("Assignment submitted successfully!");
      await refresh();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Could not submit the assignment.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = data?.stats || {};
  const progress = data?.progressOverview || [];
  const upcoming = data?.upcomingAssignments || [];
  const announcements = data?.recentAnnouncements || [];
  const attendance = data?.attendanceThisWeek || [];

  const weeklyAttendance = days.map((day) => {
    const target = new Date();
    const today = target.getDay();
    const mondayOffset = today === 0 ? -6 : 1 - today;
    const dayIndex = days.indexOf(day);
    target.setDate(target.getDate() + mondayOffset + dayIndex);
    target.setHours(0, 0, 0, 0);
    const record = attendance.find((item) => {
      const d = new Date(item.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === target.getTime();
    });
    return { day, record };
  });

  const renderPage = () => {
    if (location.pathname === "/student-dashboard")
      return <DashboardOverview />;
    
    if (location.pathname.includes("/assignments")) return <AssignmentsPage />;
    if (location.pathname.includes("/attendance")) return <AttendancePage />;
    if (location.pathname.includes("/progress")) return <ProgressPage />;
    if (location.pathname.includes("/grades")) return <GradesPage />;
    if (location.pathname.includes("/announcements"))
      return <AnnouncementsPage />;
    if (location.pathname.includes("/profile")) return <ProfilePage />;
    if (location.pathname.includes("/settings")) return <SettingsPage />;
    return <DashboardOverview />;
  };

  const DashboardOverview = () => (
    <>
      <div className="student-page-heading">
        <div>
          <h1>Student Dashboard</h1>
          <p>
            Welcome back, {data?.student?.name || user.name || "Student"}! Keep
            up the great work.
          </p>
        </div>
        <div className="student-heading-actions">
          <button className="student-notification" title="Notifications">
            <Bell size={21} />
            <span>{announcements.length}</span>
          </button>
        </div>
      </div>

      {/* Assigned Mentor Header Card */}
      {data?.student?.mentor && (
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white rounded-2xl p-5 mb-6 shadow-md border border-teal-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-200 text-teal-900 flex items-center justify-center font-bold text-xl shadow-inner flex-shrink-0">
              {(data.student.mentor.name || "M").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">
                  {data.student.mentor.name}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-700/80 text-teal-100 border border-teal-600/60">
                  Your Assigned Mentor
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                {data.student.mentor.mentorRole || "Bootcamp Mentor"} ·{" "}
                {data.student.mentor.email}
              </p>
              {data.student.mentor.expertise &&
                data.student.mentor.expertise.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {data.student.mentor.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-teal-950/40 text-teal-200 px-2 py-0.5 rounded"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {data.student.mentor.email && (
              <a
                href={`mailto:${data.student.mentor.email}`}
                className="flex items-center gap-1.5 bg-white text-teal-900 hover:bg-teal-50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Mail size={14} />
                <span>Email Mentor</span>
              </a>
            )}
            {data.student.mentor.phone && (
              <a
                href={`tel:${data.student.mentor.phone}`}
                className="flex items-center gap-1.5 bg-teal-700/80 hover:bg-teal-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-teal-600/60"
              >
                <Phone size={14} />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="student-stats-grid">
        <StatCard
          title="Attendance"
          value={`${stats.attendance || 0}%`}
          label={stats.attendance >= 75 ? "Good" : "Needs attention"}
          icon={CalendarCheck2}
          tone="teal"
        />
        <StatCard
          title="Overall Progress"
          value={`${stats.progress || 0}%`}
          label={stats.progress >= 60 ? "On Track" : "Keep going"}
          icon={GraduationCap}
          tone="green"
        />
        <StatCard
          title="Assignments"
          value={stats.assignments || 0}
          label={`${stats.pendingAssignments || 0} Pending`}
          icon={FileText}
          tone="purple"
        />
        <StatCard
          title="Average Grade"
          value={`${stats.averageGrade || 0}%`}
          label={stats.averageGrade >= 80 ? "Very Good" : "Keep improving"}
          icon={GraduationCap}
          tone="gold"
        />
      </div>

      <div className="student-content-grid">
        <SectionCard
          title="Progress Overview"
          action={
            <button
              className="student-view-btn"
              onClick={() => navigate("/student-dashboard/progress")}
            >
              View All <ChevronRight size={15} />
            </button>
          }
        >
          {progress.length ? (
            <div className="progress-list">
              {progress.slice(0, 6).map((item) => (
                <div
                  className="progress-row"
                  key={String(item.id || item._id || item.topic)}
                >
                  <div className="progress-row-top">
                    <span>{item.topic}</span>
                    <strong>{item.value || 0}%</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, item.value || 0))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No progress has been recorded yet." />
          )}
        </SectionCard>

            <SectionCard
              title="Upcoming Assignments"
              action={
                <button
                  className="student-view-btn"
                  onClick={() => navigate("/student-dashboard/assignments")}
                >
                  View All <ChevronRight size={15} />
                </button>
              }
            >
              {upcoming.length ? (
                <div className="assignment-list compact">
                  {upcoming.slice(0, 4).map((assignment) => {
                    const daysLeft = Math.ceil(
                      (new Date(assignment.deadline) - new Date()) / 86400000,
                    );
                    const urgent = daysLeft <= 2;
                    const mentorId =
                      data?.student?.mentor?._id || data?.student?.mentor;
                    const isFromMentor = Boolean(
                      mentorId &&
                      (assignment.createdBy?._id === mentorId ||
                        assignment.createdBy === mentorId ||
                        (assignment.createdBy?.email &&
                          assignment.createdBy.email ===
                            data?.student?.mentor?.email)),
                    );

                    return (
                      <button
                        className="assignment-row"
                        key={assignment._id}
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <span className="assignment-row-icon">
                          <FileText size={18} />
                        </span>
                        <span className="assignment-row-info">
                          <div className="flex items-center gap-2">
                            <strong>{assignment.title}</strong>
                            {isFromMentor && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                                From your mentor
                              </span>
                            )}
                          </div>
                          <small>Due: {formatDate(assignment.deadline)}</small>
                        </span>
                        <span
                          className={`deadline-badge ${urgent ? "urgent" : ""}`}
                        >
                          {daysLeft <= 0 ? "Due today" : `${daysLeft} Days Left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState text="No upcoming assignments." />
              )}
            </SectionCard>

            <SectionCard
              title="Recent Announcements"
              action={
                <button
                  className="student-view-btn"
                  onClick={() => navigate("/student-dashboard/announcements")}
                >
                  View All <ChevronRight size={15} />
                </button>
              }
            >
              {announcements.length ? (
                <div className="announcement-list">
                  {announcements.slice(0, 3).map((item) => {
                    const mentorId =
                      data?.student?.mentor?._id || data?.student?.mentor;
                    const isFromMentor = Boolean(
                      mentorId &&
                      (item.author?._id === mentorId ||
                        item.author === mentorId ||
                        (item.author?.email &&
                          item.author.email === data?.student?.mentor?.email)),
                    );

                    return (
                      <div className="announcement-row" key={item._id}>
                        <span className="announcement-icon">
                          <Megaphone size={16} />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong>{item.title}</strong>
                            {isFromMentor && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                                From your mentor
                              </span>
                            )}
                          </div>
                          <p>{item.content}</p>
                        </div>
                        <small>
                          {formatDate(item.publishDate || item.createdAt)}
                        </small>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState text="No announcements yet." />
              )}
            </SectionCard>

            <SectionCard title="Attendance This Week">
              <div className="weekly-attendance">
                {weeklyAttendance.map(({ day, record }) => (
                  <div className="weekly-day" key={day}>
                    <span>{day}</span>
                    <div
                      className={`weekly-status ${record?.status?.toLowerCase() || "not-marked"}`}
                    >
                      {record?.status === "Present" || record?.status === "Late" ? (
                        <Check size={20} />
                      ) : record?.status === "Absent" ? (
                        <X size={19} />
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="attendance-legend">
                <span>
                  <i className="present" /> Present
                </span>
                <span>
                  <i className="absent" /> Absent
                </span>
                <span>
                  <i className="not-marked" /> Not Marked
                </span>
              </div>
            </SectionCard>
      </div>
    </>
  );

  const AssignmentsPage = () => {
    const [assignmentsList, setAssignmentsList] = React.useState(
      data?.assignments || [],
    );
    const [asgLoading, setAsgLoading] = React.useState(false);

    React.useEffect(() => {
      setAsgLoading(true);
      API.get("/student/assignments")
        .then((res) => {
          if (res.data.success) {
            setAssignmentsList(res.data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setAsgLoading(false));
    }, []);

    return (
      <PageSection
        title="Assignments"
        subtitle="View deadlines, solve problems, submit your work, and review feedback."
      >
        <div className="student-full-list">
          {asgLoading ? (
            <EmptyState text="Loading assignments..." />
          ) : assignmentsList.length ? (
            assignmentsList.map((assignment) => (
              <div className="student-list-card" key={assignment._id}>
                <div className="list-card-icon">
                  <FileText size={20} />
                </div>
                <div className="list-card-main">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">
                      {assignment.title}
                    </h3>
                    {Boolean(
                      data?.student?.mentor &&
                      (assignment.createdBy?._id === data.student.mentor._id ||
                        assignment.createdBy === data.student.mentor._id ||
                        assignment.createdBy?.email ===
                          data.student.mentor.email),
                    ) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 shadow-sm">
                        ★ From your mentor
                      </span>
                    )}
                    {assignment.link && (
                      <a
                        href={assignment.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded"
                      >
                        <ExternalLink size={12} /> Open Problem
                      </a>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {assignment.description}
                  </p>
                  <small className="text-xs text-gray-400 mt-2 block">
                    Due {formatDate(assignment.deadline)} · Max score{" "}
                    {assignment.maxScore || 100} ·{" "}
                    {assignment.createdBy?.name
                      ? `Assigned by ${assignment.createdBy.name}`
                      : `Track: ${assignment.batch?.name || assignment.batch?.track || "Your Track"}`}
                  </small>
                </div>
                <span
                  className={`status-pill ${String(
                    assignment.status || "Pending",
                  )
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {assignment.status || "Pending"}
                </span>
                <button
                  className="student-primary-btn"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  {assignment.status === "Graded" ? "View Feedback" : "Submit"}
                </button>
              </div>
            ))
          ) : (
            <EmptyState text="No assignments are available for your track." />
          )}
        </div>
      </PageSection>
    );
  };

  const AttendancePage = () => {
    const [allAttendance, setAllAttendance] = React.useState([]);
    const [attLoading, setAttLoading] = React.useState(true);

    React.useEffect(() => {
      API.get("/student/attendance")
        .then((res) => {
          if (res.data.success) {
            const raw = res.data.data;
            const records = Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.records)
                ? raw.records
                : Array.isArray(res.data.stats?.records)
                  ? res.data.stats.records
                  : [];
            setAllAttendance(records);
          }
        })
        .catch(() => {})
        .finally(() => setAttLoading(false));
    }, []);

    const attList = Array.isArray(allAttendance) ? allAttendance : [];
    const present = attList.filter((r) => r && r.status === "Present").length;
    const absent = attList.filter((r) => r && r.status === "Absent").length;
    const late = attList.filter((r) => r && r.status === "Late").length;
    const total = attList.length;
    const rate =
      total > 0 ? Math.round((present / total) * 100) : stats.attendance || 0;

    return (
      <PageSection
        title="My Attendance"
        subtitle="Your full attendance history and current rate."
      >
        <div className="attendance-summary">
          <div>
            <span>Attendance Rate</span>
            <strong>{rate}%</strong>
          </div>
          <div>
            <span>Present</span>
            <strong>{present}</strong>
          </div>
          <div>
            <span>Absent</span>
            <strong>{absent}</strong>
          </div>
          <div>
            <span>Late</span>
            <strong>{late}</strong>
          </div>
          <div>
            <span>Total Sessions</span>
            <strong>{total}</strong>
          </div>
        </div>
        <div className="student-full-list">
          {attLoading ? (
            <EmptyState text="Loading attendance..." />
          ) : attList.length ? (
            [...attList]
              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
              .map((item, idx) => (
                <div className="student-list-card" key={item._id || idx}>
                  <div className="list-card-icon">
                    <CalendarCheck2 size={20} />
                  </div>
                  <div className="list-card-main">
                    <h3>{item.date ? formatDate(item.date) : "Session"}</h3>
                    <p>
                      {item.batch?.name ||
                        item.batch?.track ||
                        "Bootcamp Track Session"}
                    </p>
                    {item.note && (
                      <small className="text-xs text-gray-400 mt-1 block">
                        Note: {item.note}
                      </small>
                    )}
                  </div>
                  <span
                    className={`status-pill ${String(item.status || "unknown").toLowerCase()}`}
                  >
                    {item.status || "Unknown"}
                  </span>
                </div>
              ))
          ) : (
            <EmptyState text="No attendance records yet. Records appear after your mentor or admin marks attendance." />
          )}
        </div>
      </PageSection>
    );
  };

  const ProgressPage = () => {
    const [resources, setResources] = React.useState([]);
    const [progLoading, setProgLoading] = React.useState(true);
    const [savingTopic, setSavingTopic] = React.useState(null);

    const fetchResourcesProgress = async () => {
      setProgLoading(true);
      try {
        const res = await API.get("/student/resources");
        if (res.data && (res.data.success || Array.isArray(res.data))) {
          const list = res.data.data || res.data || [];
          setResources(list);
        }
      } catch (err) {
        console.error("Failed to load learning resources:", err);
      } finally {
        setProgLoading(false);
      }
    };

    React.useEffect(() => {
      fetchResourcesProgress();
    }, []);

    const handleUpdateStatus = async (resource, newStatus) => {
      const topicName = resource.title || resource.topic;
      setSavingTopic(topicName);

      // Optimistic update
      setResources((prev) =>
        prev.map((r) =>
          r.title === topicName || r._id === resource._id
            ? { ...r, status: newStatus }
            : r,
        ),
      );

      try {
        const res = await API.post("/student/progress", {
          topic: topicName,
          status: newStatus,
          week: resource.week || 1,
        });
        if (res.data.success) {
          toast.success(`${topicName} updated to "${newStatus}"!`);
          refresh(); // refresh student dashboard stats
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update status");
        fetchResourcesProgress(); // revert on error
      } finally {
        setSavingTopic(null);
      }
    };

    const statusOptions = [
      { label: "Not Started", value: "Not Started" },
      { label: "In Progress", value: "In Progress" },
      { label: "Completed", value: "Completed" },
      { label: "Need Help", value: "Need Help" },
    ];

    const getStatusPct = (status) => {
      if (status === "Completed") return 100;
      if (status === "In Progress") return 60;
      if (status === "Need Help" || status === "Needs Improvement") return 25;
      return 0;
    };

    const totalCount = resources.length;
    const completedCount = resources.filter(
      (r) => r.status === "Completed",
    ).length;
    const inProgCount = resources.filter(
      (r) => r.status === "In Progress",
    ).length;
    const needHelpCount = resources.filter(
      (r) => r.status === "Need Help" || r.status === "Needs Improvement",
    ).length;
    const overallPct =
      totalCount > 0
        ? Math.round((completedCount / totalCount) * 100)
        : stats.progress || 0;

    return (
      <PageSection
        title="Learning Resources & Progress"
        subtitle="Track your mastery on course modules, update completion status, and access study materials."
      >
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">
              Completion Rate
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {overallPct}%
              </strong>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
                {overallPct >= 70 ? "On Track" : "In Progress"}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">Completed</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {completedCount}
              </strong>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                of {totalCount} resources
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">
              In Progress
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {inProgCount}
              </strong>
              <span className="text-xs text-gray-500 dark:text-gray-400">active modules</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">Need Help</span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-red-600 dark:text-red-400">
                {needHelpCount}
              </strong>
              <span className="text-xs text-gray-500 dark:text-gray-400">needs review</span>
            </div>
          </div>
        </div>

        {/* Resources & Status Cards Grid */}
        <div className="space-y-4">
          {progLoading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2
                className="animate-spin mx-auto mb-2 text-teal-500"
                size={28}
              />
              <p className="text-sm">Loading learning resources...</p>
            </div>
          ) : resources.length > 0 ? (
            resources.map((item) => {
              const currentStatus = item.status || "Not Started";
              const pct = getStatusPct(currentStatus);
              const isSaving = savingTopic === (item.title || item.topic);

              const mentorId =
                data?.student?.mentor?._id || data?.student?.mentor;
              const isFromMentor = Boolean(
                mentorId &&
                (item.uploadedBy?._id === mentorId ||
                  item.uploadedBy === mentorId ||
                  (item.uploadedBy?.email &&
                    item.uploadedBy.email === data?.student?.mentor?.email) ||
                  item.target === "My Assigned Students"),
              );
              const isFromAdmin =
                item.uploadedBy?.role === "admin" || !item.uploadedBy;

              return (
                <div
                  key={item._id || item.title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                >
                  {/* Top: Title, Subtitle, Percentage */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">
                          {item.title}
                        </h3>
                        {isSaving && (
                          <Loader2
                            size={14}
                            className="animate-spin text-teal-400"
                          />
                        )}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        Week {item.week || 1} Curriculum
                      </div>

                      {item.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2 max-w-2xl leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start">
                      <strong
                        className={`text-lg font-bold ${
                          pct === 100
                            ? "text-teal-400"
                            : pct >= 50
                              ? "text-orange-400"
                              : pct > 0
                                ? "text-red-400"
                                : "text-teal-400"
                        }`}
                      >
                        {pct}%
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar Line */}
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden my-4">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct === 100
                            ? "#00b894"
                            : pct >= 50
                              ? "#f59e0b"
                              : pct > 0
                                ? "#ef4444"
                                : "transparent",
                      }}
                    />
                  </div>

                  {/* Bottom: Update your status + 4 Pill Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Update your status:
                      </span>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          <ExternalLink size={12} /> Open Resource
                        </a>
                      )}
                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:underline"
                        >
                          <Download size={12} /> Download File
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((opt) => {
                        const isSelected = currentStatus === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleUpdateStatus(item, opt.value)}
                            disabled={isSaving}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500 shadow-sm"
                                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mentor feedback note if any */}
                  {item.notes && (
                    <div className="mt-3 p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-xs text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/70 flex items-start gap-1.5">
                      <span className="font-bold flex-shrink-0">
                        Mentor Note:
                      </span>
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <BookOpen size={32} className="mx-auto mb-2 text-gray-400 dark:text-gray-600" />
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                No learning resources published yet
              </p>
              <p className="text-xs text-gray-500 mt-1">
                When your mentor or admin shares learning materials and
                curriculum topics for your track, they will appear here for you
                to track and complete.
              </p>
            </div>
          )}
        </div>
      </PageSection>
    );
  };

  const GradesPage = () => {
    const [submissionsList, setSubmissionsList] = React.useState([]);
    const [gradesLoading, setGradesLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState("all");

    React.useEffect(() => {
      setGradesLoading(true);
      API.get("/submissions/my")
        .then((res) => {
          if (res.data.success && Array.isArray(res.data.data)) {
            setSubmissionsList(res.data.data);
          } else {
            // Fallback to data.assignments
            const asg = (data?.assignments || []).filter(
              (a) => a.submission || a.status === "Graded",
            );
            setSubmissionsList(asg);
          }
        })
        .catch(() => {
          const asg = (data?.assignments || []).filter(
            (a) => a.submission || a.status === "Graded",
          );
          setSubmissionsList(asg);
        })
        .finally(() => setGradesLoading(false));
    }, []);

    const gradedItems = submissionsList.filter(
      (s) =>
        s.status === "Graded" || (s.score !== null && s.score !== undefined),
    );
    const pendingItems = submissionsList.filter(
      (s) => s.status === "Submitted" || s.status === "Pending",
    );
    const resubmitItems = submissionsList.filter(
      (s) => s.status === "Resubmission Required" || s.status === "Resubmit",
    );

    const totalGradedScore = gradedItems.reduce((sum, item) => {
      const score = item.score ?? 0;
      const max = item.assignment?.maxScore || item.maxScore || 100;
      return sum + (score / max) * 100;
    }, 0);

    const avgScore =
      gradedItems.length > 0
        ? Math.round(totalGradedScore / gradedItems.length)
        : stats.averageGrade || 0;

    const filteredList = submissionsList.filter((item) => {
      if (activeTab === "graded")
        return item.status === "Graded" || item.score != null;
      if (activeTab === "pending")
        return item.status === "Submitted" || item.status === "Pending";
      if (activeTab === "resubmit")
        return item.status === "Resubmission Required";
      return true;
    });

    return (
      <PageSection
        title="Grades & Submissions"
        subtitle="Review your submitted assignments, mentor grades, and code feedback."
      >
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">
              Average Grade
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {avgScore}%
              </strong>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold">
                {avgScore >= 80
                  ? "Excellent"
                  : avgScore >= 60
                    ? "Good"
                    : "Needs Review"}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">
              Graded Submissions
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-green-600 dark:text-green-400">
                {gradedItems.length}
              </strong>
              <span className="text-xs text-gray-400">completed</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">
              Awaiting Review
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-orange-500">
                {pendingItems.length}
              </strong>
              <span className="text-xs text-gray-400">with mentors</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 font-medium">
              Resubmissions
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <strong className="text-2xl font-bold text-red-500">
                {resubmitItems.length}
              </strong>
              <span className="text-xs text-gray-400">action required</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Submissions ({submissionsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("graded")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "graded"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Graded ({gradedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "pending"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Pending Review ({pendingItems.length})
          </button>
        </div>

        {/* Submissions Full List */}
        <div className="student-full-list">
          {gradesLoading ? (
            <EmptyState text="Loading grades & submissions..." />
          ) : filteredList.length ? (
            filteredList.map((item) => {
              const title =
                item.assignment?.title || item.title || "Assignment";
              const maxScore =
                item.assignment?.maxScore || item.maxScore || 100;
              const hasScore = item.score !== null && item.score !== undefined;
              const isGraded = item.status === "Graded" || hasScore;

              return (
                <div className="student-list-card" key={item._id}>
                  <div className={`list-card-icon ${isGraded ? "gold" : ""}`}>
                    <GraduationCap size={20} />
                  </div>
                  <div className="list-card-main">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">
                        {title}
                      </h3>
                      <span
                        className={`status-pill ${String(
                          item.status || "submitted",
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {item.status || "Submitted"}
                      </span>
                    </div>

                    {item.feedback && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mt-2 text-sm text-gray-700 dark:text-gray-200 border-l-4 border-teal-500">
                        <strong className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                          Mentor Feedback:
                        </strong>
                        <p>{item.feedback}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 flex-wrap text-xs">
                      {item.githubUrl && (
                        <a
                          href={item.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-medium"
                        >
                          <ExternalLink size={12} /> GitHub Submission
                        </a>
                      )}
                      {item.liveDemoUrl && (
                        <a
                          href={item.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-medium"
                        >
                          <ExternalLink size={12} /> Live Demo
                        </a>
                      )}
                      {item.submittedAt && (
                        <span className="text-gray-400">
                          Submitted on {formatDate(item.submittedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {hasScore ? (
                      <div>
                        <strong className="text-xl font-bold text-teal-600 dark:text-teal-400">
                          {item.score}/{maxScore}
                        </strong>
                        <span className="block text-xs text-gray-400 font-medium">
                          {Math.round((item.score / maxScore) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-medium">
                        Awaiting Score
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState text="No submissions found in this category. Submit your work in the Assignments tab to see your grades here." />
          )}
        </div>
      </PageSection>
    );
  };

  const AnnouncementsPage = () => {
    const [annList, setAnnList] = React.useState(announcements);
    const [annLoading, setAnnLoading] = React.useState(false);

    React.useEffect(() => {
      setAnnLoading(true);
      API.get("/student/announcements")
        .then((res) => {
          if (res.data.success) {
            setAnnList(res.data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setAnnLoading(false));
    }, []);

    return (
      <PageSection
        title="Announcements"
        subtitle="Important updates from your mentors and bootcamp team."
      >
        <div className="student-full-list">
          {annLoading ? (
            <EmptyState text="Loading announcements..." />
          ) : annList.length ? (
            annList.map((item) => (
              <div className="student-list-card" key={item._id}>
                <div className="list-card-icon">
                  <Megaphone size={20} />
                </div>
                <div className="list-card-main">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3>{item.title}</h3>
                    {Boolean(
                      data?.student?.mentor &&
                      (item.author?._id === data.student.mentor._id ||
                        item.author === data.student.mentor._id ||
                        item.author?.email === data.student.mentor.email),
                    ) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700 shadow-sm">
                        ★ From your mentor
                      </span>
                    )}
                    {item.targetAudience && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium">
                        {item.targetAudience === "all"
                          ? "Everyone"
                          : item.targetAudience === "students"
                            ? "All Students"
                            : "My Track"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                    {item.content}
                  </p>
                  <small className="text-xs text-gray-400 mt-2 block">
                    {formatDate(item.publishDate || item.createdAt)}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <EmptyState text="No announcements posted yet." />
          )}
        </div>
      </PageSection>
    );
  };

  const ProfilePage = () => {
    const [profile, setProfile] = React.useState(data?.student || user || {});
    const [editMode, setEditMode] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [formData, setFormData] = React.useState({
      name: profile.name || "",
      phone: profile.phone || "",
      gender: profile.gender || "Other",
    });
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
      setLoading(true);
      API.get("/profile")
        .then((res) => {
          if (res.data.success && res.data.data) {
            setProfile(res.data.data);
            setFormData({
              name: res.data.data.name || "",
              phone: res.data.data.phone || "",
              gender: res.data.data.gender || "Other",
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    const handleSaveProfile = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const res = await API.put("/profile", formData);
        if (res.data.success) {
          setProfile(res.data.data);
          const curUser = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem(
            "user",
            JSON.stringify({ ...curUser, name: res.data.data.name }),
          );
          toast.success("Profile updated successfully!");
          setEditMode(false);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update profile");
      } finally {
        setSaving(false);
      }
    };

    return (
      <PageSection
        title="My Profile"
        subtitle="Manage your student profile and contact details."
      >
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={28} />
            <p className="text-sm">Loading your profile...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow">
                {(profile.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                  {profile.batch?.name ||
                    profile.batch?.track ||
                    "Student Track"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
            >
              <Edit3 size={15} />
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+251 ..."
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                <span className="text-xs text-gray-400 block mb-1">
                  Email Address
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {profile.email}
                </span>
              </div>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                <span className="text-xs text-gray-400 block mb-1">
                  Phone Number
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {profile.phone || "Not set"}
                </span>
              </div>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                <span className="text-xs text-gray-400 block mb-1">Gender</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {profile.gender || "Not set"}
                </span>
              </div>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                <span className="text-xs text-gray-400 block mb-1">
                  Assigned Track
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {profile.batch?.name || profile.batch?.track || "None"}
                </span>
              </div>
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-lg col-span-1 sm:col-span-2 border border-teal-200 dark:border-teal-800">
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold block mb-1">
                  Assigned Mentor
                </span>
                {profile.mentor?.name ? (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {profile.mentor.name} ({profile.mentor.email})
                    </span>
                    {profile.mentor.phone && (
                      <span className="text-xs text-teal-700 dark:text-teal-300">
                        {profile.mentor.phone}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">
                    No mentor assigned yet by admin
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </PageSection>
    );
  };

  const SettingsPage = () => {
    const [settings, setSettings] = React.useState({
      emailNotifications: true,
      announcementNotifications: true,
      assignmentNotifications: true,
    });
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
      API.get("/settings")
        .then((res) => {
          if (res.data.success && res.data.data) {
            setSettings(res.data.data);
          }
        })
        .catch(() => {});
    }, []);

    const toggleSetting = async (key) => {
      const updated = { ...settings, [key]: !settings[key] };
      setSettings(updated);
      setSaving(true);
      try {
        await API.patch("/settings", updated);
        toast.success("Preferences updated");
      } catch (err) {
        toast.error("Failed to update settings");
      } finally {
        setSaving(false);
      }
    };

    return (
      <PageSection
        title="Settings"
        subtitle="Manage your notification and portal preferences."
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
              Notifications
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Choose what updates you want to receive.
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg cursor-pointer">
                <div>
                  <strong className="block text-sm text-gray-800 dark:text-gray-200">
                    Email Notifications
                  </strong>
                  <span className="text-xs text-gray-400">
                    Receive summary emails about your activity
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(settings.emailNotifications)}
                  onChange={() => toggleSetting("emailNotifications")}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg cursor-pointer">
                <div>
                  <strong className="block text-sm text-gray-800 dark:text-gray-200">
                    Announcement Alerts
                  </strong>
                  <span className="text-xs text-gray-400">
                    Get notified whenever mentors post announcements
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(settings.announcementNotifications)}
                  onChange={() => toggleSetting("announcementNotifications")}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg cursor-pointer">
                <div>
                  <strong className="block text-sm text-gray-800 dark:text-gray-200">
                    Assignment Deadlines
                  </strong>
                  <span className="text-xs text-gray-400">
                    Alerts when assignments are due or graded
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(settings.assignmentNotifications)}
                  onChange={() => toggleSetting("assignmentNotifications")}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </PageSection>
    );
  };

  const PageSection = ({ title, subtitle, children }) => (
    <>
      <div className="student-page-heading">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="student-heading-actions"></div>
      </div>
      {children}
    </>
  );

  if (loading) {
    return (
      <div className="student-loading-screen">
        <div className="student-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="student-loading-screen">
        <CircleAlert size={42} />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button
          className="student-primary-btn"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  const DashboardContent = () => (
    <div
      className={`student-app min-h-screen bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:text-gray-100 ${collapsed ? "sidebar-collapsed" : ""}`}
    >
      <StudentSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapse={() => setCollapsed((v) => !v)}
        isAdmitted={true}
      />
      <main className="student-main">
        <button
          className="student-mobile-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        {error && <div className="student-error-banner">{error}</div>}
        {renderPage()}
      </main>

      {selectedAssignment && (
        <div
          className="student-modal-backdrop"
          onMouseDown={() => setSelectedAssignment(null)}
        >
          <div
            className="student-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="student-modal-head">
              <div>
                <span>Assignment</span>
                <h2>{selectedAssignment.title}</h2>
              </div>
              <button onClick={() => setSelectedAssignment(null)}>
                <X size={20} />
              </button>
            </div>
            {selectedAssignment.status === "Graded" ? (
              <div className="feedback-content">
                <div className="grade-big">
                  {selectedAssignment.score}/{selectedAssignment.maxScore}
                </div>
                <p>{selectedAssignment.feedback || "No feedback was added."}</p>
                <a
                  href={selectedAssignment.submission?.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View GitHub submission
                </a>
              </div>
            ) : (
              <form onSubmit={submitAssignment} className="submit-form">
                <p>{selectedAssignment.description}</p>
                <label>
                  GitHub repository URL
                  <input
                    required
                    type="url"
                    value={submitForm.githubUrl}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        githubUrl: e.target.value,
                      })
                    }
                    placeholder="https://github.com/..."
                  />
                </label>
                <label>
                  Live demo URL <span>(optional)</span>
                  <input
                    type="url"
                    value={submitForm.liveDemoUrl}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        liveDemoUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </label>
                <label>
                  Notes <span>(optional)</span>
                  <textarea
                    rows="3"
                    value={submitForm.notes}
                    onChange={(e) =>
                      setSubmitForm({ ...submitForm, notes: e.target.value })
                    }
                    placeholder="Add a short note for your mentor"
                  />
                </label>
                <button className="student-primary-btn" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Work"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const isAdmitted = !!(data?.student?.batch || user?.batch);
  
  if (loading) {
    return (
      <div className="student-loading-screen">
        <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  return isAdmitted ? <DashboardContent /> : <Navigate to="/apply" replace />;
}
