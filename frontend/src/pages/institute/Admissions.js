// src/pages/institute/Admissions.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";
import { isInstitution } from "../../utils/authHelper";

const Admissions = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [admissions, setAdmissions] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState("all");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);

  useEffect(() => {
    if (!isInstitution()) {
      setError("Access denied. Institution account required.");
      setLoading(false);
      return;
    }
    fetchAdmissionsData();
    fetchApprovedStudents();
  }, [institutionId]);

  const fetchAdmissionsData = async () => {
    try {
      const response = await instituteAPI.getAdmissions(institutionId);
      if (response.success) {
        setAdmissions(response.admissions);
      } else {
        setError(response.error || "Failed to load admissions data");
      }
    } catch (err) {
      console.error("Error fetching admissions:", err);
      setError("Failed to load admissions data");
    }
  };

  const fetchApprovedStudents = async () => {
    try {
      const response = await instituteAPI.getApplications(institutionId);
      if (response.success) {
        // Filter only approved applications
        const approved = response.applications.filter(app => app.status === "approved");
        setApprovedStudents(approved);
      } else {
        setError(response.error || "Failed to load student data");
      }
    } catch (err) {
      console.error("Error fetching approved students:", err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = selectedAdmission === "all" 
    ? approvedStudents 
    : approvedStudents.filter(student => student.admissionId === selectedAdmission);

  const handleStatusUpdate = async (applicationId, newStatus, studentName) => {
    try {
      setStatusUpdateLoading(applicationId);
      
      await instituteAPI.updateApplicationStatus(applicationId, { 
        status: newStatus,
        notes: `Status updated to ${newStatus} by institution`
      });
      
      // Update local state
      setApprovedStudents(prev => 
        prev.map(student => 
          student.id === applicationId 
            ? { ...student, status: newStatus }
            : student
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update student status");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleBackToDashboard = () => {
    navigate(`/institute/${institutionId}/home`);
  };

  const getStatusCount = (status) => {
    return filteredStudents.filter(student => student.status === status).length;
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Admissions...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <button style={styles.backButton} onClick={handleBackToDashboard}>
              ← Back to Dashboard
            </button>
          </div>
          <div style={styles.headerMain}>
            <div>
              <h1 style={styles.title}>Admissions Management</h1>
              <p style={styles.subtitle}>Manage approved student applications and enrollment status</p>
            </div>
            <Link 
              to={`/institute/${institutionId}/admissions/publish`} 
              style={styles.publishButton}
            >
              + Publish New Admission
            </Link>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}></div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* Enhanced Stats Overview */}
      <div style={styles.statsOverview}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statNumber}>{filteredStudents.length}</div>
          <div style={styles.statLabel}>Total Students</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statNumber}>{getStatusCount("approved")}</div>
          <div style={styles.statLabel}>Approved</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statNumber}>{getStatusCount("enrolled")}</div>
          <div style={styles.statLabel}>Enrolled</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statNumber}>{admissions.length}</div>
          <div style={styles.statLabel}>Active Cycles</div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div style={styles.filterSection}>
        <div style={styles.filterHeader}>
          <h3 style={styles.filterTitle}>Filter Applications</h3>
          <div style={styles.filterStats}>
            Showing {filteredStudents.length} of {approvedStudents.length} students
          </div>
        </div>
        <div style={styles.filterControls}>
          <label style={styles.filterLabel}>
            Admission Cycle:
            <select 
              value={selectedAdmission} 
              onChange={(e) => setSelectedAdmission(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Admission Cycles</option>
              {admissions.map(admission => (
                <option key={admission.id} value={admission.id}>
                  {admission.title} ({new Date(admission.publishedAt).getFullYear()})
                </option>
              ))}
            </select>
          </label>
          <div style={styles.statusFilters}>
            <span style={styles.statusFilterLabel}>Quick Status:</span>
            <button 
              style={selectedAdmission === "all" ? styles.statusFilterActive : styles.statusFilter}
              onClick={() => setSelectedAdmission("all")}
            >
              All
            </button>
            {admissions.slice(0, 2).map(admission => (
              <button
                key={admission.id}
                style={selectedAdmission === admission.id ? styles.statusFilterActive : styles.statusFilter}
                onClick={() => setSelectedAdmission(admission.id)}
              >
                {admission.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Students Table */}
      <div style={styles.tableSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>
            Approved Students
            <span style={styles.studentCount}> ({filteredStudents.length})</span>
          </h3>
          <div style={styles.sectionActions}>
            <button onClick={fetchApprovedStudents} style={styles.refreshButton}>
              ↻ Refresh
            </button>
          </div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}></div>
            <h4 style={styles.emptyTitle}>No Approved Students</h4>
            <p style={styles.emptyText}>
              {selectedAdmission === "all" 
                ? "There are no approved students across all admission cycles." 
                : "No students approved for the selected admission cycle."}
            </p>
            <div style={styles.emptyActions}>
              <Link 
                to={`/institute/${institutionId}/applications`} 
                style={styles.reviewLink}
              >
                Review Applications
              </Link>
              <Link 
                to={`/institute/${institutionId}/admissions/publish`} 
                style={styles.publishLink}
              >
                Publish Admission
              </Link>
            </div>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student Information</th>
                  <th style={styles.th}>Course & Faculty</th>
                  <th style={styles.th}>Application Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.studentInfo}>
                        <div style={styles.studentAvatar}>
                          {student.studentDetails?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <strong style={styles.studentName}>
                            {student.studentDetails?.name || "N/A"}
                          </strong>
                          <div style={styles.studentEmail}>
                            {student.studentDetails?.email || "No email"}
                          </div>
                          <div style={styles.studentId}>
                            ID: {student.studentId || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.courseInfo}>
                        <strong style={styles.courseName}>
                          {student.courseDetails?.name || "Course not found"}
                        </strong>
                        <div style={styles.facultyName}>
                          {student.courseDetails?.faculty || "Faculty not specified"}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateInfo}>
                        <div style={styles.applicationDate}>
                          {new Date(student.appliedAt).toLocaleDateString()}
                        </div>
                        <div style={styles.daysAgo}>
                          {Math.floor((new Date() - new Date(student.appliedAt)) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(student.status === 'approved' ? styles.statusApproved : {}),
                        ...(student.status === 'enrolled' ? styles.statusEnrolled : {}),
                        ...(student.status === 'rejected' ? styles.statusRejected : {})
                      }}>
                        {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        {student.status === "approved" && (
                          <button
                            style={statusUpdateLoading === student.id ? styles.enrollButtonDisabled : styles.enrollButton}
                            onClick={() => handleStatusUpdate(student.id, "enrolled", student.studentDetails?.name)}
                            disabled={statusUpdateLoading === student.id}
                          >
                            {statusUpdateLoading === student.id ? (
                              <div style={styles.buttonContent}>
                                <div style={styles.smallSpinner}></div>
                                Processing...
                              </div>
                            ) : (
                              " Enroll Student"
                            )}
                          </button>
                        )}
                        {student.status === "enrolled" && (
                          <button
                            style={statusUpdateLoading === student.id ? styles.withdrawButtonDisabled : styles.withdrawButton}
                            onClick={() => handleStatusUpdate(student.id, "approved", student.studentDetails?.name)}
                            disabled={statusUpdateLoading === student.id}
                          >
                            {statusUpdateLoading === student.id ? (
                              <div style={styles.buttonContent}>
                                <div style={styles.smallSpinner}></div>
                                Processing...
                              </div>
                            ) : (
                              " Withdraw Enrollment"
                            )}
                          </button>
                        )}
                        <Link 
                          to={`/institute/${institutionId}/applications/${student.id}`}
                          style={styles.viewDetailsButton}
                        >
                           View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
    padding: "0 20px 40px 20px",
    background: "#fafbfc",
    minHeight: "100vh"
  },
  header: {
    background: "#ffffff",
    padding: "30px",
    marginBottom: 24,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9"
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  backButton: {
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "10px 20px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: 0,
    fontWeight: "400"
  },
  publishButton: {
    background: "#1a1a1a",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    border: "1px solid #1a1a1a"
  },
  error: {
    background: "#fef2f2",
    padding: "20px",
    borderRadius: 8,
    color: "#dc2626",
    marginBottom: 24,
    border: "1px solid #fecaca",
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  errorIcon: {
    fontSize: "16px",
    flexShrink: 0
  },
  errorContent: {
    flex: 1
  },
  errorTitle: {
    display: "block",
    marginBottom: 4,
    fontSize: "14px"
  },
  errorMessage: {
    fontSize: "14px",
    opacity: 0.9
  },
  retryBtn: {
    background: "#1a1a1a",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  statsOverview: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 24
  },
  statCard: {
    background: "#ffffff",
    padding: "24px 20px",
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9",
    transition: "all 0.2s ease"
  },
  statIcon: {
    fontSize: "24px",
    marginBottom: 12
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500"
  },
  filterSection: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: 8,
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9"
  },
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  filterTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0
  },
  filterStats: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500"
  },
  filterControls: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  filterSelect: {
    padding: "10px 12px",
    border: "1px solid #d0d7de",
    borderRadius: 6,
    fontSize: "14px",
    background: "#ffffff",
    color: "#1a1a1a",
    minWidth: 250
  },
  statusFilters: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  statusFilterLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500",
    marginRight: 8
  },
  statusFilter: {
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  statusFilterActive: {
    background: "#1a1a1a",
    color: "#ffffff",
    border: "1px solid #1a1a1a",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500"
  },
  tableSection: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0
  },
  studentCount: {
    color: "#666",
    fontWeight: "400"
  },
  sectionActions: {
    display: "flex",
    gap: 12
  },
  refreshButton: {
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    color: "#666"
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 12px 0"
  },
  emptyText: {
    fontSize: "15px",
    margin: "0 0 24px 0",
    lineHeight: "1.5"
  },
  emptyActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap"
  },
  reviewLink: {
    display: "inline-block",
    background: "#1a1a1a",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  publishLink: {
    display: "inline-block",
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "12px 24px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: 6,
    border: "1px solid #e1e5e9"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 800
  },
  th: {
    padding: "16px 20px",
    textAlign: "left",
    borderBottom: "2px solid #e1e5e9",
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: "14px",
    background: "#fafbfc"
  },
  tr: {
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s ease"
  },
  td: {
    padding: "20px",
    fontSize: "14px",
    verticalAlign: "top"
  },
  studentInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#1a1a1a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "14px",
    flexShrink: 0
  },
  studentName: {
    color: "#1a1a1a",
    marginBottom: 4,
    display: "block"
  },
  studentEmail: {
    fontSize: "13px",
    color: "#666",
    marginBottom: 2
  },
  studentId: {
    fontSize: "12px",
    color: "#8c8c8c"
  },
  courseInfo: {
    lineHeight: 1.4
  },
  courseName: {
    color: "#1a1a1a",
    marginBottom: 4,
    display: "block"
  },
  facultyName: {
    fontSize: "13px",
    color: "#666"
  },
  dateInfo: {
    lineHeight: 1.4
  },
  applicationDate: {
    color: "#1a1a1a",
    marginBottom: 2
  },
  daysAgo: {
    fontSize: "12px",
    color: "#8c8c8c"
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: 12,
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  },
  statusApproved: {
    background: "#f0f9f0",
    color: "#0f7a0f",
    border: "1px solid #e1f5e1"
  },
  statusEnrolled: {
    background: "#f0f9ff",
    color: "#0369a1",
    border: "1px solid #bae6fd"
  },
  statusRejected: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca"
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 140
  },
  enrollButton: {
    background: "#0f7a0f",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  enrollButtonDisabled: {
    background: "#8c8c8c",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "not-allowed",
    fontSize: "12px"
  },
  withdrawButton: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  withdrawButtonDisabled: {
    background: "#8c8c8c",
    color: "#ffffff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "not-allowed",
    fontSize: "12px"
  },
  viewDetailsButton: {
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    textDecoration: "none",
    textAlign: "center",
    transition: "all 0.2s ease"
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  smallSpinner: {
    width: 12,
    height: 12,
    border: "2px solid transparent",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "100px 20px",
    textAlign: "center"
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #f0f0f0",
    borderTop: "4px solid #1a1a1a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 16
  },
  loadingText: {
    fontSize: "16px",
    color: "#666",
    fontWeight: "500"
  }
};

// Add CSS for spinner animation
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default Admissions;
