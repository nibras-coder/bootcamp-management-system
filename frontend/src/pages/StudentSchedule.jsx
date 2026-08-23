import React, { useEffect, useState } from "react";
import API from "../api/axios";

function StudentSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/student/schedule")
      .then((response) => {
        setSchedule(response.data || []);
      })
      .catch(() => {
        setSchedule([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="student-page">

      <div className="student-page-heading">
        <div>
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h1>My Schedule</h1>
          <p>
            See your upcoming lectures, practices and
            bootcamp activities.
          </p>
        </div>
      </div>

      <div className="student-page-card">

        {loading ? (
          <div className="student-empty-state">
            Loading your schedule...
          </div>
        ) : schedule.length === 0 ? (
          <div className="student-empty-state">
            <span>📅</span>
            <h3>No schedule available</h3>
            <p>
              Your upcoming bootcamp activities will
              appear here when they are published.
            </p>
          </div>
        ) : (
          <div className="schedule-list">
            {schedule.map((item) => (
              <div
                className="schedule-item"
                key={item._id || item.id}
              >
                <div className="schedule-time">
                  <strong>
                    {item.startTime || "--:--"}
                  </strong>

                  <span>
                    {item.endTime || ""}
                  </span>
                </div>

                <div className="schedule-details">
                  <h3>{item.title}</h3>

                  <p>
                    {item.type || "Bootcamp activity"}
                  </p>

                  {item.location && (
                    <small>
                      📍 {item.location}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentSchedule;