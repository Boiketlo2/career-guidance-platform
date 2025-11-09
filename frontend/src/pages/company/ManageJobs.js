// src/pages/company/ManageJobs.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const ManageJobs = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleEdit = (jobId) => {
    navigate(`/company/${companyId}/jobs/edit/${jobId}`);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await companyAPI.deleteJob(companyId, jobId);
      if (res?.success) {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      } else {
        alert("Failed to delete job");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting job");
    }
  };

  if (loading)
    return <div style={styles.loading}>Loading Jobs...</div>;

  return (
    <div style={styles.container}>
      <h1>Manage Jobs</h1>
      <button
        style={styles.addBtn}
        onClick={() => navigate(`/company/${companyId}/post-job`)}
      >
        ➕ Add New Job
      </button>

      {jobs.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No jobs posted yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Type</th>
              <th>Applicants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.location}</td>
                <td>{job.type}</td>
                <td>{job.applicants?.length || 0}</td>
                <td>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(job.id)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f7f9fc",
    minHeight: "100vh",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    fontSize: "1.2rem",
  },
  addBtn: {
    background: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  editBtn: {
    background: "#2196f3",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px",
  },
  deleteBtn: {
    background: "#f44336",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ManageJobs;
