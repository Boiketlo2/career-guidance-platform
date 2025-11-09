// src/pages/company/ViewApplicants.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const ViewApplicants = () => {
  const { companyId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) fetchJobs();
  }, [companyId]);

  const fetchJobs = async () => {
    try {
      const res = await companyAPI.getJobs(companyId);
      if (res?.success) setJobs(res.jobs);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setApplicants(job.applicants || []);
  };

  if (loading) return <div style={styles.loading}>Loading jobs...</div>;

  return (
    <div style={styles.container}>
      <h1>View Applicants</h1>

      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <>
          <div style={styles.jobList}>
            <label>Select Job:</label>
            <select
              style={styles.select}
              onChange={(e) =>
                handleSelectJob(jobs.find((j) => j.id === e.target.value))
              }
            >
              <option value="">-- Select a job --</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {selectedJob && (
            <div style={styles.applicantsSection}>
              <h2>Applicants for "{selectedJob.title}"</h2>
              {applicants.length === 0 ? (
                <p>No applicants yet.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Resume</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app.id}>
                        <td>{app.name}</td>
                        <td>{app.email}</td>
                        <td>
                          {app.resume ? (
                            <a href={app.resume} target="_blank" rel="noreferrer">
                              View Resume
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td>{app.status || "Pending"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  loading: { padding: "40px", textAlign: "center", fontSize: "1.2rem" },
  jobList: { marginBottom: "20px" },
  select: { padding: "8px", borderRadius: "4px", minWidth: "200px" },
  applicantsSection: { marginTop: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { borderBottom: "1px solid #ccc", padding: "10px", textAlign: "left" },
  td: { borderBottom: "1px solid #eee", padding: "10px" },
};

export default ViewApplicants;
