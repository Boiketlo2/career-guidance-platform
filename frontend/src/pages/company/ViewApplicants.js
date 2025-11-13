import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const ViewApplicants = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) fetchJobs();
  }, [companyId]);

  useEffect(() => {
    if (location.state?.selectedJobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === location.state.selectedJobId);
      if (job) handleSelectJob(job);
    }
  }, [location.state, jobs]);

  const fetchJobs = async () => {
    try {
      setError('');
      const res = await companyAPI.getJobs(companyId);
      console.log('ViewApplicants Jobs Response:', res);
      
      if (res?.success) {
        setJobs(res.jobs || []);
      } else {
        setError(res?.error || 'Failed to load jobs');
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError('Failed to load jobs. Please check company ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setApplicants([]);
    
    try {
      const res = await companyAPI.getJobApplicants(job.id);
      console.log('Applicants Response:', res);
      
      if (res?.success) {
        setApplicants(res.applicants || []);
      } else {
        setError(res?.error || 'Failed to load applicants');
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError('Failed to load applicants for this job');
    }
  };

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      const res = await companyAPI.updateApplicantStatus(selectedJob.id, applicantId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      
      if (res?.success) {
        setApplicants(prev => prev.map(app => 
          app.id === applicantId ? { ...app, status: newStatus } : app
        ));
        alert(`Applicant status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Error updating applicant status:", err);
      alert('Failed to update applicant status');
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Applicants...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>View Applicants</h1>
            <p style={styles.subtitle}>Manage and review job applications</p>
            <p style={styles.companyId}>Company ID: {companyId}</p>
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

        {jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>👥</div>
            <h3 style={styles.emptyStateTitle}>No jobs posted yet</h3>
            <p style={styles.emptyStateText}>Post a job to start receiving applications</p>
          </div>
        ) : (
          <div style={styles.content}>
            {/* Job Selection */}
            <div style={styles.jobSelectionCard}>
              <label style={styles.jobSelectionLabel}>
                Select Job to View Applicants
              </label>
              <select
                style={styles.jobSelect}
                onChange={(e) => {
                  const job = jobs.find(j => j.id === e.target.value);
                  if (job) handleSelectJob(job);
                }}
                value={selectedJob?.id || ''}
              >
                <option value="">-- Select a job --</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.applicants?.length || 0} applicants)
                  </option>
                ))}
              </select>
            </div>

            {/* Applicants List */}
            {selectedJob && (
              <div style={styles.applicantsContainer}>
                <div style={styles.applicantsHeader}>
                  <h2 style={styles.applicantsTitle}>
                    Applicants for "{selectedJob.title}"
                  </h2>
                  <p style={styles.applicantsSubtitle}>
                    <span style={styles.applicantCount}>{applicants.length}</span> applicant(s) found • 
                    <span style={styles.jobDetails}> {selectedJob.location} • {selectedJob.jobType}</span>
                  </p>
                </div>

                {applicants.length === 0 ? (
                  <div style={styles.noApplicants}>
                    <div style={styles.noApplicantsIcon}>📝</div>
                    <h3 style={styles.noApplicantsTitle}>No applicants yet</h3>
                    <p style={styles.noApplicantsText}>Applications will appear here when students apply</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead style={styles.tableHead}>
                        <tr>
                          <th style={styles.tableHeader}>Applicant</th>
                          <th style={styles.tableHeader}>Contact</th>
                          <th style={styles.tableHeader}>Education</th>
                          <th style={styles.tableHeader}>Status</th>
                          <th style={styles.tableHeader}>Actions</th>
                        </tr>
                      </thead>
                      <tbody style={styles.tableBody}>
                        {applicants.map((applicant) => (
                          <tr key={applicant.id} style={styles.tableRow}>
                            <td style={styles.tableCell}>
                              <div style={styles.applicantName}>
                                {applicant.name || 'Not Provided'}
                              </div>
                              <div style={styles.applicantField}>
                                {applicant.fieldOfStudy || 'Field not specified'}
                              </div>
                            </td>
                            <td style={styles.tableCell}>
                              <div style={styles.contactEmail}>{applicant.email}</div>
                              <div style={styles.contactPhone}>{applicant.phone || 'Phone not provided'}</div>
                            </td>
                            <td style={styles.tableCell}>
                              <div style={styles.educationLevel}>
                                {applicant.educationLevel || 'Education level not specified'}
                              </div>
                              {applicant.institution && (
                                <div style={styles.institution}>
                                  {applicant.institution}
                                </div>
                              )}
                            </td>
                            <td style={styles.tableCell}>
                              <span style={{
                                ...styles.statusBadge,
                                ...styles.statusBadgeTypes[applicant.status] || styles.statusBadgeTypes.pending
                              }}>
                                {applicant.status || 'pending'}
                              </span>
                            </td>
                            <td style={styles.tableCell}>
                              <select
                                value={applicant.status || 'pending'}
                                onChange={(e) => updateApplicantStatus(applicant.id, e.target.value)}
                                style={styles.statusSelect}
                              >
                                <option value="pending">Pending Review</option>
                                <option value="reviewed">Under Review</option>
                                <option value="interview">Interview Stage</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Not Selected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
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
  header: {
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
    margin: "0 0 4px 0",
    fontWeight: "400"
  },
  companyId: {
    fontSize: "14px",
    color: "#888888",
    margin: "0",
    fontWeight: "500",
    fontFamily: "'Courier New', monospace"
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
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
    padding: "60px 40px",
    textAlign: "center"
  },
  emptyStateIcon: {
    fontSize: "48px",
    marginBottom: "20px"
  },
  emptyStateTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#000000",
    margin: "0 0 12px 0"
  },
  emptyStateText: {
    fontSize: "15px",
    color: "#666666",
    margin: "0"
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  jobSelectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
    padding: "24px"
  },
  jobSelectionLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333333",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  jobSelect: {
    width: "100%",
    maxWidth: "500px",
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#000000",
    transition: "all 0.3s ease"
  },
  applicantsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
    overflow: "hidden"
  },
  applicantsHeader: {
    padding: "24px",
    borderBottom: "2px solid #f0f0f0",
    backgroundColor: "#fafafa"
  },
  applicantsTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 8px 0"
  },
  applicantsSubtitle: {
    fontSize: "14px",
    color: "#666666",
    margin: "0"
  },
  applicantCount: {
    fontWeight: "700",
    color: "#000000"
  },
  jobDetails: {
    color: "#555555"
  },
  noApplicants: {
    padding: "60px 40px",
    textAlign: "center"
  },
  noApplicantsIcon: {
    fontSize: "48px",
    marginBottom: "20px"
  },
  noApplicantsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#000000",
    margin: "0 0 12px 0"
  },
  noApplicantsText: {
    fontSize: "14px",
    color: "#666666",
    margin: "0"
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
  tableHeader: {
    padding: "16px 20px",
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
    padding: "20px",
    fontSize: "14px",
    color: "#333333",
    verticalAlign: "top"
  },
  applicantName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "4px"
  },
  applicantField: {
    fontSize: "13px",
    color: "#666666",
    fontStyle: "italic"
  },
  contactEmail: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#000000",
    marginBottom: "2px"
  },
  contactPhone: {
    fontSize: "13px",
    color: "#666666"
  },
  educationLevel: {
    fontSize: "14px",
    color: "#333333",
    marginBottom: "4px"
  },
  institution: {
    fontSize: "12px",
    color: "#888888",
    fontStyle: "italic"
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
  statusBadgeTypes: {
    pending: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a"
    },
    reviewed: {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
      border: "1px solid #93c5fd"
    },
    interview: {
      backgroundColor: "#e0e7ff",
      color: "#3730a3",
      border: "1px solid #a5b4fc"
    },
    approved: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0"
    },
    rejected: {
      backgroundColor: "#fecaca",
      color: "#991b1b",
      border: "1px solid #fca5a5"
    }
  },
  statusSelect: {
    padding: "8px 12px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "13px",
    backgroundColor: "#ffffff",
    color: "#000000",
    transition: "all 0.3s ease",
    minWidth: "140px"
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

// Add CSS animations
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  select:focus {
    outline: none;
    border-color: #333333 !important;
    box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
  }
  
  select:hover {
    border-color: #999999;
  }
  
  tr:hover {
    background-color: #f8f9fa !important;
  }
`;

// Only add the style once
if (!document.getElementById('view-applicants-styles')) {
  styleElement.id = 'view-applicants-styles';
  document.head.appendChild(styleElement);
}

export default ViewApplicants;
