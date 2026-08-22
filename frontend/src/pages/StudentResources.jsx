import React, { useEffect, useState } from "react";
import API from "../api/axios";

function StudentResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/student/resources")
      .then((response) => {
        setResources(response.data || []);
      })
      .catch(() => {
        setResources([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="student-page">

      <div className="student-page-heading">
        <div>
          <p className="eyebrow">
            LEARNING MATERIALS
          </p>

          <h1>Learning Resources</h1>

          <p>
            Access the resources provided for your
            bootcamp learning.
          </p>
        </div>
      </div>

      <div className="student-page-card">

        {loading ? (
          <div className="student-empty-state">
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="student-empty-state">
            <span>📚</span>

            <h3>No resources available</h3>

            <p>
              Learning materials will appear here when
              they are published.
            </p>
          </div>
        ) : (
          <div className="resource-grid">
            {resources.map((resource) => (
              <a
                className="resource-card"
                href={resource.url || "#"}
                target="_blank"
                rel="noreferrer"
                key={
                  resource._id ||
                  resource.id ||
                  resource.title
                }
              >
                <div className="resource-icon">
                  📚
                </div>

                <div>
                  <h3>
                    {resource.title}
                  </h3>

                  <p>
                    {resource.description ||
                      "Learning resource"}
                  </p>

                  <span>
                    {resource.type ||
                      "Resource"}{" "}
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentResources;