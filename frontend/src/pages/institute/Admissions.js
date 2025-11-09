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

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
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
    }
  };

  const handleBackToDashboard = () => {
    navigate(`/institute/${institutionId}/dashboard`);
  };

  if (loading) return <div style={styles.loading}>Loading Admissions...</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          <h1 style={styles.title}>Admissions Management</h1>
          <p style={styles.subtitle}>Manage approved student applications</p>
        </div>
        
        <div style={styles.headerRight}>
          <Link 
            to={`/institute/${institutionId}/admissions/publish`} 
            style={styles.publishButton}
          >
            📢 Publish New Admission
          </Link>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div style={styles.statsOverview}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{approvedStudents.length}</div>
          <div style={styles.statLabel}>Total Approved</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {approvedStudents.filter(s => s.status === "approved").length}
          </div>
          <div style={styles.statLabel}>Currently Approved</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {approvedStudents.filter(s => s.status === "enrolled").length}
          </div>
          <div style={styles.statLabel}>Enrolled Students</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>
          Filter by Admission Cycle:
          <select 
            value={selectedAdmission} 
            onChange={(e) => setSelectedAdmission(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Admissions</option>
            {admissions.map(admission => (
              <option key={admission.id} value={admission.id}>
                {admission.title} ({new Date(admission.publishedAt).getFullYear()})
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Students Table */}
      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>
          Approved Students ({filteredStudents.length})
        </h3>
        
        {filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎓</div>
            <h4>No approved students found</h4>
            <p>Students who are approved will appear here for enrollment management.</p>
            <Link 
              to={`/institute/${institutionId}/applications`} 
              style={styles.reviewLink}
            >
              Review Applications
            </Link>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Applied On</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.studentInfo}>
                        <strong>{student.studentDetails?.name || "N/A"}</strong>
                        <div style={styles.studentEmail}>
                          {student.studentDetails?.email || "No email"}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {student.courseDetails?.name || "Course not found"}
                    </td>
                    <td style={styles.td}>
                      {new Date(student.appliedAt).toLocaleDateString()}
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
                            style={styles.enrollButton}
                            onClick={() => handleStatusUpdate(student.id, "enrolled")}
                          >
                            Mark as Enrolled
                          </button>
                        )}
                        {student.status === "enrolled" && (
                          <button
                            style={styles.withdrawButton}
                            onClick={() => handleStatusUpdate(student.id, "approved")}
                          >
                            Mark as Not Enrolled
                          </button>
                        )}
                        <Link 
                          to={`/institute/${institutionId}/applications`}
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
    padding: "20px",
    background: "#f8f9fa",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "1px solid #e9ecef"
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    display: "flex",
    alignItems: "center"
  },
  backButton: {
    background: "transparent",
    border: "1px solid #6c757d",
    color: "#6c757d",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 10,
    fontSize: "14px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 5px 0"
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: 0
  },
  publishButton: {
    background: "#28a745",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px"
  },
  error: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "12px 16px",
    borderRadius: 6,
    marginBottom: 24,
    border: "1px solid #f5c6cb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  retryBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500"
  },
  statsOverview: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 30
  },
  statCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
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
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: 4,
    fontSize: "14px"
  },
  tableSection: {
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 20px 0"
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#666"
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: 16
  },
  reviewLink: {
    display: "inline-block",
    background: "#007bff",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 6,
    textDecoration: "none",
    marginTop: 16,
    fontWeight: "500"
  },
  tableContainer: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    borderBottom: "2px solid #e9ecef",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px"
  },
  tr: {
    borderBottom: "1px solid #e9ecef"
  },
  td: {
    padding: "16px",
    fontSize: "14px"
  },
  studentInfo: {
    lineHeight: 1.4
  },
  studentEmail: {
    fontSize: "12px",
    color: "#666",
    marginTop: 4
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  },
  statusApproved: {
    background: "#d4edda",
    color: "#155724"
  },
  statusEnrolled: {
    background: "#cce7ff",
    color: "#004085"
  },
  statusRejected: {
    background: "#f8d7da",
    color: "#721c24"
  },
  actionButtons: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  enrollButton: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500"
  },
  withdrawButton: {
    background: "#ffc107",
    color: "#212529",
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500"
  },
  viewDetailsButton: {
    background: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    textDecoration: "none"
  },
  loading: {
    textAlign: "center",
    padding: 100,
    fontSize: 18,
    color: "#666"
  }
};

export default Admissions;