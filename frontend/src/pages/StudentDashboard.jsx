import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { go } from "../utils/navigation";
import "./Student-Dashboard.css";

const navItems = [
  ["/student-dashboard", "Dashboard", "⌂"],
  ["/student-dashboard/schedule", "My Schedule", "◷"],
  ["/student-dashboard/attendance", "My Attendance", "✓"],
  ["/student-dashboard/progress", "My Progress", "↗"],
  ["/student-dashboard/assignments", "Assignments", "▣"],
  ["/student-dashboard/grades", "Grades", "☆"],
  ["/student-dashboard/announcements", "Announcements", "◇"],
  ["/student-dashboard/achievements", "Achievements", "♛"],
  ["/student-dashboard/resources", "Resources", "▤"],
];

const fallback = {
  profile: {
    name: "",
    email: "",
    role: "student",
    track: "",
    batch: "",
  },

  stats: {
    attendance: null,
    progress: null,
    pendingAssignments: null,
    averageGrade: null,
  },

  progress: [],
  assignments: [],
  announcements: [],
  attendanceWeek: [],
  schedule: [],
  attendance: [],
  grades: [],
  achievements: [],
  resources: [],
};

function initials(name = "Student") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "ST"
  );
}

function formatDate(date) {
  if (!date) return "Not specified";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "teal",
}) {
  return (
    <div className="student-stat-card">
      <div className="student-stat-info">
        <p>{label}</p>
        <strong>{value}</strong>

        {hint && (
          <span className={`stat-hint ${tone}`}>
            {hint}
          </span>
        )}
      </div>

      <div className={`student-stat-icon ${tone}`}>
        {icon}
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`student-panel ${className}`}
    >
      <div className="student-panel-head">
        <h2>{title}</h2>
        {action}
      </div>

      {children}
    </section>
  );
}

function EmptyState({
  icon = "◇",
  title = "No data available yet",
  text = "There is nothing to display here yet.",
}) {
  return (
    <div className="student-empty-state">
      <div className="student-empty-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

function StudentDashboard() {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [currentPath, setCurrentPath] = useState(
    window.location.pathname
  );

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
      setOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    };

    window.addEventListener(
      "popstate",
      updatePath
    );

    return () => {
      window.removeEventListener(
        "popstate",
        updatePath
      );
    };
  }, []);

  useEffect(() => {
    let alive = true;

    API.get("/student/dashboard")
      .then(({ data: response }) => {
        if (!alive || !response) return;

        setData({
          ...fallback,
          ...response,

          profile: {
            ...fallback.profile,
            ...(response.profile || {}),
          },

          stats: {
            ...fallback.stats,
            ...(response.stats || {}),
          },

          progress: Array.isArray(response.progress)
            ? response.progress
            : [],

          assignments: Array.isArray(
            response.assignments
          )
            ? response.assignments
            : [],

          announcements: Array.isArray(
            response.announcements
          )
            ? response.announcements
            : [],

          attendanceWeek: Array.isArray(
            response.attendanceWeek
          )
            ? response.attendanceWeek
            : [],

          schedule: Array.isArray(response.schedule)
            ? response.schedule
            : [],

          attendance: Array.isArray(
            response.attendance
          )
            ? response.attendance
            : [],

          grades: Array.isArray(response.grades)
            ? response.grades
            : [],

          achievements: Array.isArray(
            response.achievements
          )
            ? response.achievements
            : [],

          resources: Array.isArray(
            response.resources
          )
            ? response.resources
            : [],
        });
      })
      .catch(() => {
        if (alive) {
          setData(fallback);
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const profile =
    data.profile || fallback.profile;

  const stats =
    data.stats || fallback.stats;

  const name =
    profile.name ||
    user.name ||
    "Student";

  const navigate = (path) => {
    go(path);

    setCurrentPath(path);
    setOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const isDashboard =
    currentPath === "/student-dashboard";

  const pageTitles = {
    "/student-dashboard/schedule": [
      "My Schedule",
      "View your upcoming bootcamp sessions and learning schedule.",
      "◷",
    ],

    "/student-dashboard/attendance": [
      "My Attendance",
      "View your complete attendance record.",
      "✓",
    ],

    "/student-dashboard/progress": [
      "My Progress",
      "Track your learning progress across all topics.",
      "↗",
    ],

    "/student-dashboard/assignments": [
      "Assignments",
      "View your assignments, deadlines and submissions.",
      "▣",
    ],

    "/student-dashboard/grades": [
      "Grades",
      "View your grades and mentor feedback.",
      "☆",
    ],

    "/student-dashboard/announcements": [
      "Announcements",
      "View the latest announcements from the bootcamp.",
      "◇",
    ],

    "/student-dashboard/achievements": [
      "Achievements",
      "View your unlocked achievements and milestones.",
      "♛",
    ],

    "/student-dashboard/resources": [
      "Resources",
      "Access learning materials and useful resources.",
      "▤",
    ],

    "/student-dashboard/profile": [
      "My Profile",
      "View your student information and bootcamp details.",
      "♙",
    ],

    "/student-dashboard/settings": [
      "Settings",
      "Manage your account and dashboard preferences.",
      "⚙",
    ],
  };

  const pageInfo =
    pageTitles[currentPath];

  return (
    <div className="student-portal">

      {open && (
        <button
          className="student-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`student-sidebar ${
          open ? "open" : ""
        }`}
      >
        <div
          className="student-brand"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              navigate("/");
            }
          }}
        >
          <img
            src="/assets/msj-logo.jpg"
            alt="ASTU MSJ"
          />

          <div>
            <b>ASTU MSJ</b>
            <small>Bootcamp System</small>
          </div>
        </div>

        <div className="student-nav-label">
          Workspace
        </div>

        <nav className="student-navigation">
          {navItems.map(
            ([path, label, icon]) => (
              <button
                key={path}
                className={
                  currentPath === path
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(path)
                }
              >
                <span className="nav-icon">
                  {icon}
                </span>

                <span className="nav-text">
                  {label}
                </span>

                {label === "Assignments" &&
                  stats.pendingAssignments != null && (
                    <em>
                      {stats.pendingAssignments}
                    </em>
                  )}
              </button>
            )
          )}
        </nav>

        <div className="student-nav-label account-label">
          Account
        </div>

        <nav className="student-navigation">
          <button
            className={
              currentPath ===
              "/student-dashboard/profile"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate(
                "/student-dashboard/profile"
              )
            }
          >
            <span className="nav-icon">
              ♙
            </span>

            <span className="nav-text">
              Profile
            </span>
          </button>

          <button
            className={
              currentPath ===
              "/student-dashboard/settings"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate(
                "/student-dashboard/settings"
              )
            }
          >
            <span className="nav-icon">
              ⚙
            </span>

            <span className="nav-text">
              Settings
            </span>
          </button>
        </nav>

        <div className="mentor-note">
          <b>✦ Mentor note</b>

          <p>
            Small, consistent steps are how you
            finish strong.
          </p>
        </div>

        <button
          className="student-signout"
          onClick={logout}
        >
          <span>↪</span>
          Sign out
        </button>

        <button
          className="student-user"
          onClick={() =>
            navigate(
              "/student-dashboard/profile"
            )
          }
        >
          <div className="student-avatar">
            {initials(name)}
          </div>

          <div className="student-user-info">
            <b>{name}</b>

            <small>
              Student
              {profile.track
                ? ` · ${profile.track}`
                : ""}
            </small>
          </div>
        </button>
      </aside>

      <div className="student-main">

        <header className="student-topbar">
          <div className="student-breadcrumb">
            <button
              className="mobile-menu"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>

            <span className="breadcrumb-dot">
              ●
            </span>

            <span className="breadcrumb-learning">
              Learning space
            </span>

            <b>/</b>

            <span>
              {isDashboard
                ? "Student Dashboard"
                : pageInfo?.[0] ||
                  "Student Dashboard"}
            </span>
          </div>

          <div className="student-top-actions">
            <button
              className="student-bell"
              onClick={() =>
                navigate(
                  "/student-dashboard/announcements"
                )
              }
              aria-label="Announcements"
            >
              ♧
              <i />
            </button>

            <button
              className="student-top-profile"
              onClick={() =>
                navigate(
                  "/student-dashboard/profile"
                )
              }
            >
              <div className="student-avatar small">
                {initials(name)}
              </div>

              <span>{name}</span>

              <b>⌄</b>
            </button>
          </div>
        </header>

        {isDashboard && (
          <DashboardHome
            data={data}
            stats={stats}
            profile={profile}
            name={name}
            navigate={navigate}
            loading={loading}
          />
        )}

        {!isDashboard && (
          <StudentPage
            path={currentPath}
            data={data}
            profile={profile}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

function DashboardHome({
  data,
  stats,
  profile,
  name,
  navigate,
  loading,
}) {
  const progress = data.progress || [];
  const assignments = data.assignments || [];
  const announcements = data.announcements || [];
  const attendanceWeek =
    data.attendanceWeek || [];

  return (
    <main className="student-content">

      <div className="student-heading">
        <div className="student-heading-text">
          <p className="eyebrow">
            YOUR LEARNING SPACE
          </p>

          <h1>Student Dashboard</h1>

          <p>
            Welcome back,{" "}
            {name.split(" ")[0]}.
            {loading
              ? " Loading your latest information..."
              : " Keep up the great work."}
          </p>
        </div>

        <div className="student-batch">
          <span>●</span>

          {profile.batch ||
            "Your Batch"}
        </div>
      </div>

      <div className="student-stats-grid">
        <StatCard
          label="Attendance"
          value={
            stats.attendance != null
              ? `${Number(
                  stats.attendance
                ).toFixed(1)}%`
              : "—"
          }
          hint={
            stats.attendance != null
              ? "Current"
              : "Not available"
          }
          icon="◷"
          tone="teal"
        />

        <StatCard
          label="Overall Progress"
          value={
            stats.progress != null
              ? `${stats.progress}%`
              : "—"
          }
          hint={
            stats.progress != null
              ? "Current"
              : "Not available"
          }
          icon="◔"
          tone="blue"
        />

        <StatCard
          label="Assignments"
          value={
            stats.pendingAssignments != null
              ? stats.pendingAssignments
              : "—"
          }
          hint={
            stats.pendingAssignments != null
              ? "Pending"
              : "Not available"
          }
          icon="▣"
          tone="purple"
        />

        <StatCard
          label="Average Grade"
          value={
            stats.averageGrade != null
              ? `${Number(
                  stats.averageGrade
                ).toFixed(1)}%`
              : "—"
          }
          hint={
            stats.averageGrade != null
              ? "Current"
              : "Not available"
          }
          icon="☆"
          tone="gold"
        />
      </div>

      <div className="student-dashboard-grid">

        <Panel
          title="Progress Overview"
          action={
            <button
              onClick={() =>
                navigate(
                  "/student-dashboard/progress"
                )
              }
            >
              View All
            </button>
          }
        >
          {progress.length === 0 ? (
            <EmptyState
              icon="↗"
              title="No progress recorded yet"
              text="Your learning progress will appear here once it is available."
            />
          ) : (
            <div className="progress-list">
              {progress.map(
                (item, index) => {
                  const label =
                    item.topic ||
                    item.name ||
                    item[0] ||
                    `Topic ${index + 1}`;

                  const value =
                    item.percent ??
                    item.value ??
                    item.progress ??
                    item[1] ??
                    0;

                  const safeValue = Math.max(
                    0,
                    Math.min(
                      100,
                      Number(value) || 0
                    )
                  );

                  return (
                    <div
                      className="progress-row"
                      key={
                        label || index
                      }
                    >
                      <div className="progress-row-top">
                        <span>
                          {label}
                        </span>

                        <b>
                          {safeValue}%
                        </b>
                      </div>

                      <div className="progress-track">
                        <i
                          style={{
                            width: `${safeValue}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </Panel>

        <Panel
          title="Upcoming Assignments"
          action={
            <button
              onClick={() =>
                navigate(
                  "/student-dashboard/assignments"
                )
              }
            >
              View All
            </button>
          }
        >
          {assignments.length === 0 ? (
            <EmptyState
              icon="▣"
              title="No assignments yet"
              text="Your assignments will appear here when they are added."
            />
          ) : (
            <div className="assignment-list">
              {assignments
                .slice(0, 3)
                .map((item, index) => (
                  <button
                    className="assignment-item"
                    key={
                      item._id ||
                      item.title ||
                      index
                    }
                    onClick={() =>
                      navigate(
                        "/student-dashboard/assignments"
                      )
                    }
                  >
                    <span className="assignment-icon">
                      ▣
                    </span>

                    <div>
                      <b>
                        {item.title}
                      </b>

                      <small>
                        Due:{" "}
                        {formatDate(
                          item.deadline ||
                            item.due
                        )}
                      </small>
                    </div>

                    <em
                      className={
                        Number(
                          item.daysLeft
                        ) <= 2
                          ? "urgent"
                          : "soon"
                      }
                    >
                      {item.daysLeft != null
                        ? `${item.daysLeft} Days Left`
                        : "View"}
                    </em>
                  </button>
                ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Recent Announcements"
          action={
            <button
              onClick={() =>
                navigate(
                  "/student-dashboard/announcements"
                )
              }
            >
              View All
            </button>
          }
        >
          {announcements.length === 0 ? (
            <EmptyState
              icon="◇"
              title="No announcements"
              text="New bootcamp announcements will appear here."
            />
          ) : (
            <div className="announcement-list">
              {announcements
                .slice(0, 3)
                .map((item, index) => (
                  <button
                    className="announcement-item"
                    key={
                      item._id ||
                      item.title ||
                      index
                    }
                    onClick={() =>
                      navigate(
                        "/student-dashboard/announcements"
                      )
                    }
                  >
                    <span className="announcement-icon">
                      ◇
                    </span>

                    <div>
                      <b>
                        {item.title}
                      </b>

                      <small>
                        {item.content}
                      </small>
                    </div>

                    <em>
                      {item.time ||
                        "Recently"}
                    </em>
                  </button>
                ))}
            </div>
          )}
        </Panel>

        <Panel title="Attendance This Week">
          {attendanceWeek.length === 0 ? (
            <EmptyState
              icon="✓"
              title="No attendance data"
              text="Your attendance will appear here once sessions are recorded."
            />
          ) : (
            <>
              <div className="week-head">
                {[
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <span key={day}>
                    {day}
                  </span>
                ))}
              </div>

              <div className="week-status">
                {attendanceWeek
                  .slice(0, 6)
                  .map(
                    (status, index) => (
                      <span
                        key={index}
                        className={
                          status ===
                          "present"
                            ? "present"
                            : status ===
                              "absent"
                            ? "absent"
                            : "none"
                        }
                      >
                        {status ===
                        "present"
                          ? "✓"
                          : status ===
                            "absent"
                          ? "×"
                          : "—"}
                      </span>
                    )
                  )}
              </div>

              <div className="attendance-legend">
                <span>
                  <i className="present" />
                  Present
                </span>

                <span>
                  <i className="absent" />
                  Absent
                </span>

                <span>
                  <i className="none" />
                  Not marked
                </span>
              </div>
            </>
          )}
        </Panel>
      </div>

      {loading && (
        <p className="student-loading">
          Loading your latest bootcamp data…
        </p>
      )}
    </main>
  );
}

function StudentPage({
  path,
  data,
  profile,
  navigate,
}) {
  switch (path) {
    case "/student-dashboard/schedule":
      return <SchedulePage data={data} />;

    case "/student-dashboard/attendance":
      return <AttendancePage data={data} />;

    case "/student-dashboard/progress":
      return <ProgressPage data={data} />;

    case "/student-dashboard/assignments":
      return <AssignmentsPage data={data} />;

    case "/student-dashboard/grades":
      return <GradesPage data={data} />;

    case "/student-dashboard/announcements":
      return (
        <AnnouncementsPage data={data} />
      );

    case "/student-dashboard/achievements":
      return (
        <AchievementsPage data={data} />
      );

    case "/student-dashboard/resources":
      return <ResourcesPage data={data} />;

    case "/student-dashboard/profile":
      return <ProfilePage profile={profile} />;

    case "/student-dashboard/settings":
      return <SettingsPage />;

    default:
      navigate("/student-dashboard");
      return null;
  }
}

function SchedulePage({ data }) {
  const schedule = data.schedule || [];

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="My Schedule"
        description="View your upcoming bootcamp sessions and learning schedule."
        icon="◷"
      />

      {schedule.length === 0 ? (
        <EmptyState
          icon="◷"
          title="No schedule available"
          text="Your upcoming sessions will appear here once they are scheduled."
        />
      ) : (
        <div className="student-page-grid">
          {schedule.map(
            (item, index) => (
              <div
                className="student-info-card schedule-card"
                key={
                  item._id || index
                }
              >
                <div className="schedule-date">
                  <b>{item.date}</b>
                  <span>{item.day}</span>
                </div>

                <div className="schedule-info">
                  <span className="small-label">
                    {item.type || "Session"}
                  </span>

                  <h3>{item.title}</h3>

                  <p>
                    ◷ {item.time}
                  </p>

                  <small>
                    {item.mentor ||
                      "Bootcamp Session"}
                  </small>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}

function AttendancePage({ data }) {
  const attendance = data.attendance || [];

  const rate =
    data.stats?.attendance != null
      ? Number(
          data.stats.attendance
        ).toFixed(1)
      : null;

  const presentCount =
    attendance.filter(
      (item) =>
        String(
          item.status
        ).toLowerCase() ===
        "present"
    ).length;

  const absentCount =
    attendance.filter(
      (item) =>
        String(
          item.status
        ).toLowerCase() ===
        "absent"
    ).length;

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="My Attendance"
        description="View your complete attendance record."
        icon="✓"
      />

      <div className="student-stats-grid">
        <StatCard
          label="Attendance Rate"
          value={
            rate != null
              ? `${rate}%`
              : "—"
          }
          hint={
            rate != null
              ? "Current"
              : "Not available"
          }
          icon="✓"
          tone="teal"
        />

        <StatCard
          label="Present"
          value={
            attendance.length
              ? presentCount
              : "—"
          }
          hint={
            attendance.length
              ? "Sessions"
              : "Not available"
          }
          icon="●"
          tone="blue"
        />

        <StatCard
          label="Absent"
          value={
            attendance.length
              ? absentCount
              : "—"
          }
          hint={
            attendance.length
              ? "Sessions"
              : "Not available"
          }
          icon="×"
          tone="purple"
        />
      </div>

      <Panel title="Attendance Record">
        {attendance.length === 0 ? (
          <EmptyState
            icon="✓"
            title="No attendance records"
            text="Your attendance records will appear here once sessions are recorded."
          />
        ) : (
          <div className="student-table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map(
                  (item, index) => (
                    <tr
                      key={
                        item._id ||
                        index
                      }
                    >
                      <td>
                        {formatDate(
                          item.date
                        )}
                      </td>

                      <td>
                        {item.session ||
                          item.title ||
                          "Bootcamp Session"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            String(
                              item.status
                            ).toLowerCase() ===
                            "present"
                              ? "success"
                              : "danger"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </main>
  );
}

function ProgressPage({ data }) {
  const progress = data.progress || [];

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="My Progress"
        description="Track your learning progress across all topics."
        icon="↗"
      />

      <Panel title="Learning Progress">
        {progress.length === 0 ? (
          <EmptyState
            icon="↗"
            title="No progress recorded yet"
            text="Your learning progress will appear here once it is available."
          />
        ) : (
          <div className="full-progress-list">
            {progress.map(
              (item, index) => {
                const label =
                  item.topic ||
                  item.name ||
                  item[0] ||
                  `Topic ${index + 1}`;

                const value =
                  Number(
                    item.percent ??
                      item.value ??
                      item.progress ??
                      item[1] ??
                      0
                  ) || 0;

                const safeValue =
                  Math.max(
                    0,
                    Math.min(
                      100,
                      value
                    )
                  );

                return (
                  <div
                    className="full-progress-item"
                    key={
                      label ||
                      index
                    }
                  >
                    <div>
                      <b>{label}</b>
                      <span>
                        {safeValue}%
                      </span>
                    </div>

                    <div className="progress-track">
                      <i
                        style={{
                          width: `${safeValue}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </Panel>
    </main>
  );
}

function AssignmentsPage({ data }) {
  const assignments =
    data.assignments || [];

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Assignments"
        description="View your assignments, deadlines and submissions."
        icon="▣"
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon="▣"
          title="No assignments yet"
          text="Your assignments will appear here when they are added."
        />
      ) : (
        <div className="assignment-page-list">
          {assignments.map(
            (item, index) => (
              <div
                className="student-info-card assignment-page-card"
                key={
                  item._id ||
                  index
                }
              >
                <div className="large-page-icon">
                  ▣
                </div>

                <div className="assignment-page-info">
                  <span className="small-label">
                    Assignment
                  </span>

                  <h3>{item.title}</h3>

                  <p>
                    Due:{" "}
                    {formatDate(
                      item.deadline ||
                        item.due
                    )}
                  </p>
                </div>

                <div className="assignment-page-status">
                  <span
                    className={`status-badge ${
                      item.status ===
                      "Completed"
                        ? "success"
                        : "warning"
                    }`}
                  >
                    {item.status ||
                      "Pending"}
                  </span>

                  {item.daysLeft != null && (
                    <small>
                      {item.daysLeft}{" "}
                      days left
                    </small>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}

function GradesPage({ data }) {
  const grades = data.grades || [];

  const average =
    data.stats?.averageGrade != null
      ? Number(
          data.stats.averageGrade
        ).toFixed(1)
      : null;

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Grades"
        description="View your grades and mentor feedback."
        icon="☆"
      />

      <div className="student-stats-grid">
        <StatCard
          label="Average Grade"
          value={
            average != null
              ? `${average}%`
              : "—"
          }
          hint={
            average != null
              ? "Current"
              : "Not available"
          }
          icon="☆"
          tone="gold"
        />
      </div>

      <Panel title="Your Grades">
        {grades.length === 0 ? (
          <EmptyState
            icon="☆"
            title="No grades yet"
            text="Your grades and mentor feedback will appear here once they are available."
          />
        ) : (
          <div className="student-table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Score</th>
                  <th>Feedback</th>
                </tr>
              </thead>

              <tbody>
                {grades.map(
                  (item, index) => (
                    <tr
                      key={
                        item._id ||
                        index
                      }
                    >
                      <td>
                        <b>
                          {item.assignment ||
                            item.title}
                        </b>
                      </td>

                      <td>
                        <strong>
                          {item.score}
                          /
                          {item.total ||
                            100}
                        </strong>
                      </td>

                      <td>
                        {item.feedback ||
                          "No feedback yet."}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </main>
  );
}

function AnnouncementsPage({
  data,
}) {
  const announcements =
    data.announcements || [];

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Announcements"
        description="View the latest announcements from the bootcamp."
        icon="◇"
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon="◇"
          title="No announcements"
          text="New bootcamp announcements will appear here."
        />
      ) : (
        <div className="announcement-page-list">
          {announcements.map(
            (item, index) => (
              <article
                className="student-info-card announcement-page-card"
                key={
                  item._id ||
                  index
                }
              >
                <div className="large-page-icon">
                  ◇
                </div>

                <div>
                  <div className="announcement-page-top">
                    <h3>
                      {item.title}
                    </h3>

                    <span>
                      {item.time ||
                        "Recently"}
                    </span>
                  </div>

                  <p>
                    {item.content ||
                      item.description ||
                      "No additional information available."}
                  </p>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}

function AchievementsPage({
  data,
}) {
  const achievements =
    data.achievements || [];

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Achievements"
        description="View your unlocked achievements and milestones."
        icon="♛"
      />

      {achievements.length === 0 ? (
        <EmptyState
          icon="♛"
          title="No achievements yet"
          text="Your achievements and milestones will appear here."
        />
      ) : (
        <div className="achievement-grid">
          {achievements.map(
            (item, index) => (
              <article
                className="student-info-card achievement-card"
                key={
                  item._id ||
                  index
                }
              >
                <div className="achievement-icon">
                  {item.icon ||
                    "🏆"}
                </div>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                <small>
                  {item.date ||
                    "Unlocked"}
                </small>
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}

function ResourcesPage({
  data,
}) {
  const resources =
    data.resources || [];

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Resources"
        description="Access learning materials and useful resources."
        icon="▤"
      />

      {resources.length === 0 ? (
        <EmptyState
          icon="▤"
          title="No resources yet"
          text="Learning materials will appear here when they are available."
        />
      ) : (
        <div className="resource-grid">
          {resources.map(
            (item, index) => (
              <article
                className="student-info-card resource-card"
                key={
                  item._id ||
                  index
                }
              >
                <div className="large-page-icon">
                  ▤
                </div>

                <span className="small-label">
                  {item.type ||
                    "Learning Resource"}
                </span>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                <button>
                  Open Resource →
                </button>
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}

function ProfilePage({
  profile,
}) {
  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="My Profile"
        description="View your student information and bootcamp details."
        icon="♙"
      />

      <div className="profile-layout">
        <section className="student-info-card profile-card">
          <div className="profile-avatar">
            {initials(
              profile.name ||
                "Student"
            )}
          </div>

          <h2>
            {profile.name ||
              "Student"}
          </h2>

          <p>
            {profile.email ||
              "Student account"}
          </p>

          <span className="status-badge success">
            Student
          </span>
        </section>

        <section className="student-info-card profile-details">
          <h2>Student Information</h2>

          <div className="profile-row">
            <span>Full Name</span>
            <b>
              {profile.name ||
                "Not available"}
            </b>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <b>
              {profile.email ||
                "Not available"}
            </b>
          </div>

          <div className="profile-row">
            <span>Track</span>
            <b>
              {profile.track ||
                "Not available"}
            </b>
          </div>

          <div className="profile-row">
            <span>Batch</span>
            <b>
              {profile.batch ||
                "Not available"}
            </b>
          </div>

          <div className="profile-row">
            <span>Role</span>
            <b>
              {profile.role ||
                "student"}
            </b>
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingsPage() {
  const [notifications, setNotifications] =
    useState(true);

  const [emailUpdates, setEmailUpdates] =
    useState(true);

  return (
    <main className="student-content">
      <PageHeading
        eyebrow="STUDENT PORTAL"
        title="Settings"
        description="Manage your account and dashboard preferences."
        icon="⚙"
      />

      <div className="settings-list">

        <section className="student-info-card settings-card">
          <div>
            <h3>
              Notifications
            </h3>

            <p>
              Receive important bootcamp
              announcements.
            </p>
          </div>

          <button
            className={`toggle ${
              notifications
                ? "on"
                : ""
            }`}
            onClick={() =>
              setNotifications(
                (value) => !value
              )
            }
            aria-label="Toggle notifications"
          >
            <span />
          </button>
        </section>

        <section className="student-info-card settings-card">
          <div>
            <h3>
              Email Updates
            </h3>

            <p>
              Receive updates about
              assignments and grades.
            </p>
          </div>

          <button
            className={`toggle ${
              emailUpdates
                ? "on"
                : ""
            }`}
            onClick={() =>
              setEmailUpdates(
                (value) => !value
              )
            }
            aria-label="Toggle email updates"
          >
            <span />
          </button>
        </section>

        <section className="student-info-card settings-card">
          <div>
            <h3>
              Account Security
            </h3>

            <p>
              Keep your account secure
              with a strong password.
            </p>
          </div>

          <button className="settings-action">
            Change Password
          </button>
        </section>
      </div>
    </main>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
    <div className="student-page-heading">
      <div>
        <p className="eyebrow">
          {eyebrow}
        </p>

        <h1>{title}</h1>

        <p>
          {description}
        </p>
      </div>

      <div className="student-page-heading-icon">
        {icon}
      </div>
    </div>
  );
}

export default StudentDashboard;