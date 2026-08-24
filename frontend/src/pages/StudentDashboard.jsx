import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import API from "../api/axios";

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



function StudentSidebar({ mobileOpen, onClose, collapsed, onCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

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
          {navItems.map(({ path, label, icon: Icon }) => {
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
            className="student-nav-item logout"
            onClick={logout}
            title="Logout"
          >
            <LogOut size={19} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
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
      await refresh();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not submit the assignment.",
      );
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
                      <strong>{assignment.title}</strong>
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
              {announcements.slice(0, 3).map((item) => (
                <div className="announcement-row" key={item._id}>
                  <span className="announcement-icon">
                    <Megaphone size={16} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.content}</p>
                  </div>
                  <small>
                    {formatDate(item.publishDate || item.createdAt)}
                  </small>
                </div>
              ))}
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

  const AssignmentsPage = () => (
    <PageSection
      title="Assignments"
      subtitle="View deadlines, submit your work, and review feedback."
    >
      <div className="student-full-list">
        {(data?.assignments || []).length ? (
          data.assignments.map((assignment) => (
            <div className="student-list-card" key={assignment._id}>
              <div className="list-card-icon">
                <FileText size={20} />
              </div>
              <div className="list-card-main">
                <h3>{assignment.title}</h3>
                <p>{assignment.description}</p>
                <small>
                  Due {formatDate(assignment.deadline)} · Max score{" "}
                  {assignment.maxScore}
                </small>
              </div>
              <span
                className={`status-pill ${assignment.status.toLowerCase().replaceAll(" ", "-")}`}
              >
                {assignment.status}
              </span>
              <button
                className="student-primary-btn"
                onClick={() =>
                  assignment.status === "Graded"
                    ? setSelectedAssignment(assignment)
                    : setSelectedAssignment(assignment)
                }
              >
                {assignment.status === "Graded" ? "View feedback" : "Submit"}
              </button>
            </div>
          ))
        ) : (
          <EmptyState text="No assignments are available for your batch." />
        )}
      </div>
    </PageSection>
  );

  const AttendancePage = () => (
    <PageSection
      title="My Attendance"
      subtitle="Your attendance records and current percentage."
    >
      <div className="attendance-summary">
        <div>
          <span>Attendance</span>
          <strong>{stats.attendance || 0}%</strong>
        </div>
        <div>
          <span>Present</span>
          <strong>{stats.attendedSessions || 0}</strong>
        </div>
        <div>
          <span>Total Sessions</span>
          <strong>{stats.totalSessions || 0}</strong>
        </div>
      </div>
      <div className="student-full-list">
        {(data?.attendanceThisWeek || []).length ? (
          data.attendanceThisWeek.map((item) => (
            <div className="student-list-card" key={item.date}>
              <div className="list-card-icon">
                <CalendarCheck2 size={20} />
              </div>
              <div className="list-card-main">
                <h3>{formatDate(item.date)}</h3>
                <p>Attendance status for this session</p>
              </div>
              <span className={`status-pill ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>
          ))
        ) : (
          <EmptyState text="No attendance records have been returned yet." />
        )}
      </div>
    </PageSection>
  );

  const ProgressPage = () => (
    <PageSection
      title="My Progress"
      subtitle="Track your learning progress by topic."
    >
      <div className="progress-detail-grid">
        {progress.length ? (
          progress.map((item) => (
            <div
              className="progress-detail-card"
              key={String(item.id || item._id || item.topic)}
            >
              <div className="progress-row-top">
                <strong>{item.topic}</strong>
                <strong>{item.value || 0}%</strong>
              </div>
              <div className="progress-track">
                <div style={{ width: `${item.value || 0}%` }} />
              </div>
              <small>{item.status}</small>
            </div>
          ))
        ) : (
          <EmptyState text="Your mentor has not added progress yet." />
        )}
      </div>
    </PageSection>
  );

  const GradesPage = () => {
    const graded = (data?.assignments || []).filter(
      (item) => item.status === "Graded",
    );
    return (
      <PageSection
        title="Grades"
        subtitle="Your graded assignments and mentor feedback."
      >
        <div className="student-full-list">
          {graded.length ? (
            graded.map((item) => (
              <div className="student-list-card" key={item._id}>
                <div className="list-card-icon gold">
                  <GraduationCap size={20} />
                </div>
                <div className="list-card-main">
                  <h3>{item.title}</h3>
                  <p>{item.feedback || "No feedback provided."}</p>
                </div>
                <strong className="grade-value">
                  {item.score}/{item.maxScore}
                </strong>
              </div>
            ))
          ) : (
            <EmptyState text="No graded assignments yet." />
          )}
        </div>
      </PageSection>
    );
  };

  const AnnouncementsPage = () => (
    <PageSection
      title="Announcements"
      subtitle="Important updates from your bootcamp team."
    >
      <div className="student-full-list">
        {announcements.length ? (
          announcements.map((item) => (
            <div className="student-list-card" key={item._id}>
              <div className="list-card-icon">
                <Megaphone size={20} />
              </div>
              <div className="list-card-main">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <small>{formatDate(item.publishDate || item.createdAt)}</small>
              </div>
            </div>
          ))
        ) : (
          <EmptyState text="No announcements yet." />
        )}
      </div>
    </PageSection>
  );

  const ProfilePage = () => (
    <PageSection title="Profile" subtitle="Your bootcamp account information.">
      <div className="profile-panel">
        <div className="student-avatar large">
          {(data?.student?.name || user.name || "S").charAt(0).toUpperCase()}
        </div>
        <div>
          <h2>{data?.student?.name || user.name}</h2>
          <p>{data?.student?.email || user.email}</p>
          <span>{data?.student?.batch?.name || "No batch assigned yet"}</span>
        </div>
      </div>
    </PageSection>
  );

  const SettingsPage = () => (
    <PageSection title="Settings" subtitle="Manage your dashboard preferences.">
      <div className="settings-panel">
        <div>
          <strong>Dark mode</strong>
          <p>
            Use the theme button in the top-right corner to switch between light
            and dark mode.
          </p>
        </div>
        
      </div>
    </PageSection>
  );

  const PageSection = ({ title, subtitle, children }) => (
    <>
      <div className="student-page-heading">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="student-heading-actions">
          
        </div>
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

  return (
    <div className={`student-app min-h-screen bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:text-gray-100 ${collapsed ? "sidebar-collapsed" : ""}`}>
      <StudentSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapse={() => setCollapsed((v) => !v)}
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
}
