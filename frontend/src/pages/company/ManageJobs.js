import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const ManageJobs = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) fetchJobs();
  }, [companyId]);

  const fetchJobs = async () => {
    try {
      setError('');
      const res = await companyAPI.getJobs(companyId);
      console.log('ManageJobs API Response:', res);
      
      if (res?.success) {
        setJobs(res.jobs || []);
      } else {
        setError(res?.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError('Failed to load jobs. Please check if the company ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/company/${companyId}/applicants`, { state: { selectedJobId: jobId } });
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;

    try {
      // Note: You'll need to implement deleteJob in your backend
      // For now, we'll just remove it from the local state
      setJobs(prev => prev.filter(job => job.id !== jobId));
      alert("Job deleted successfully (local only - backend not implemented)");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Job Listings...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>Manage Job Postings</h1>
            <p style={styles.subtitle}>Create and manage your job postings</p>
          </div>
        </div>

        {/* Quick action cards: Post Job & Available Functions */}
        <div style={styles.quickActionsGrid}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/company/${companyId}/post-job`)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/company/${companyId}/post-job`)}
            style={styles.actionCard}
            aria-label="Post new job"
          >
            <div>
              <p style={styles.actionLabel}>Post New Job</p>
              <p style={styles.actionTitle}>Create Job Posting</p>
              <p style={styles.actionDescription}>Fill out the details and publish your opening</p>
            </div>
          </div>

          <div style={styles.actionCard}>
            <div>
              <p style={styles.actionLabel}>Available Functions</p>
              <p style={styles.actionTitle}>Quick Actions</p>
              <div style={styles.actionButtons}>
                <button
                  onClick={() => navigate(`/company/${companyId}/jobs`)}
                  style={styles.secondaryButton}
                >
                  View Listings
                </button>
                <button
                  onClick={() => navigate(`/company/${companyId}/applicants`)}
                  style={styles.secondaryButton}
                >
                  View Applicants
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <div style={styles.errorContent}>
              <h3 style={styles.errorText}>
                {error}
              </h3>
            </div>
          </div>
        )}

        {jobs.length > 0 && (
          <div style={styles.jobsTableContainer}>
            <div style={styles.tableHeader}>
              <div style={styles.tableHeaderContent}>
                <h2 style={styles.tableTitle}>
                  Your Job Postings ({jobs.length})
                </h2>
                <span style={styles.companyId}>
                  Company ID: {companyId}
                </span>
              </div>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Job Title</th>
                    <th style={styles.tableHeaderCell}>Location</th>
                    <th style={styles.tableHeaderCell}>Type</th>
                    <th style={styles.tableHeaderCell}>Applicants</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody style={styles.tableBody}>
                  {jobs.map((job) => (
                    <tr key={job.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.jobTitle}>{job.title}</div>
                        <div style={styles.jobDescription}>
                          {job.description}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.jobLocation}>{job.location}</div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.jobTypeBadge}>
                          {job.jobType}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.applicantCount}>
                          <span style={styles.applicantNumber}>{job.applicants?.length || 0}</span>
                          <span style={styles.applicantLabel}>applicants</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.statusBadge,
                          ...(job.status === 'active' ? styles.statusActive : styles.statusInactive)
                        }}>
                          {job.status || 'active'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleViewApplicants(job.id)}
                            style={styles.viewButton}
                          >
                            View Applicants
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "32px 20px",
    fontFamily: "'Arial', sans-serif"
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto"
  },
  headerSection: {
    marginBottom: "32px"
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    fontSize: "16px",
    color: "#666666",
    margin: "0",
    fontWeight: "400"
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "32px"
  },
  actionCard: {
    backgroundColor: "#ffffff",
    padding: "28px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "2px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minHeight: "140px",
    display: "flex",
    alignItems: "center"
  },
  actionLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#666666",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  actionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 12px 0"
  },
  actionDescription: {
    fontSize: "14px",
    color: "#666666",
    margin: "0",
    lineHeight: "1.5"
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "16px"
  },
  secondaryButton: {
    backgroundColor: "#333333",
    color: "#ffffff",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px"
  },
  errorContent: {
    display: "flex",
    alignItems: "center"
  },
  errorText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#dc2626",
    margin: "0"
  },
  jobsTableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
    overflow: "hidden"
  },
  tableHeader: {
    padding: "20px 24px",
    borderBottom: "2px solid #f0f0f0",
    backgroundColor: "#fafafa"
  },
  tableHeaderContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  tableTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#000000",
    margin: "0"
  },
  companyId: {
    fontSize: "13px",
    color: "#666666",
    fontWeight: "500"
  },
  tableWrapper: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHead: {
    backgroundColor: "#f8f9fa"
  },
  tableHeaderCell: {
    padding: "16px 24px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "700",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e0e0e0"
  },
  tableBody: {
    backgroundColor: "#ffffff"
  },
  tableRow: {
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s ease"
  },
  tableCell: {
    padding: "20px 24px",
    fontSize: "14px",
    color: "#333333",
    verticalAlign: "top"
  },
  jobTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "4px"
  },
  jobDescription: {
    fontSize: "13px",
    color: "#666666",
    lineHeight: "1.4",
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical"
  },
  jobLocation: {
    fontSize: "14px",
    color: "#555555",
    fontWeight: "500"
  },
  jobTypeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    border: "1px solid #e5e7eb"
  },
  applicantCount: {
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  applicantNumber: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#000000"
  },
  applicantLabel: {
    fontSize: "12px",
    color: "#666666",
    fontWeight: "500"
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize"
  },
  statusActive: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0"
  },
  statusInactive: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb"
  },
  actionButtons: {
    display: "flex",
    gap: "8px"
  },
  viewButton: {
    backgroundColor: "#333333",
    color: "#ffffff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  deleteButton: {
    backgroundColor: "#ffffff",
    color: "#dc2626",
    padding: "6px 12px",
    border: "1px solid #dc2626",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    gap: "16px"
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #333333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    fontSize: "16px",
    color: "#666666",
    fontWeight: "600"
  }
};

// Add CSS animation for spinner
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default ManageJobs;
