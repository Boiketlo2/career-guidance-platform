import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const ManageFaculties = () => {
  const { institutionId } = useParams();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFaculties();
  }, [institutionId]);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await instituteAPI.getFaculties(institutionId);
      console.log("📋 Faculties response:", res);
      
      if (res.success) {
        setFaculties(res.faculties || []);
      } else {
        setError(res.error || "Failed to load faculties");
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError(err.response?.data?.error || "Failed to load faculties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facultyId, facultyName) => {
    if (!window.confirm(`Are you sure you want to delete "${facultyName}"? This action cannot be undone and will remove all associated courses.`)) return;

    try {
      setDeleteLoading(facultyId);
      setError("");
      setSuccess("");
      
      const res = await instituteAPI.deleteFaculty(institutionId, facultyId);
      if (res.success) {
        setSuccess(`Faculty "${facultyName}" deleted successfully!`);
        fetchFaculties();
      } else {
        setError(res.error || "Failed to delete faculty");
      }
    } catch (err) {
      console.error("Delete faculty error:", err);
      setError(err.response?.data?.error || "Error deleting faculty");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Faculties...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Manage Faculties</h1>
          <p style={styles.subtitle}>Create and manage faculties for your institution</p>
        </div>
        <Link to={`/institute/${institutionId}/faculties/add`} style={styles.addBtn}>
          + Add New Faculty
        </Link>
      </div>

      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
          <button onClick={fetchFaculties} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {success && (
        <div style={styles.success}>
          <div style={styles.successIcon}>✓</div>
          <div style={styles.successContent}>
            <strong style={styles.successTitle}>Success</strong>
            <div style={styles.successMessage}>{success}</div>
          </div>
        </div>
      )}

      {faculties.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏛️</div>
          <h3 style={styles.emptyTitle}>No Faculties Found</h3>
          <p style={styles.emptyText}>Get started by creating your first faculty for your institution.</p>
          <Link to={`/institute/${institutionId}/faculties/add`} style={styles.emptyAddBtn}>
            + Add Your First Faculty
          </Link>
        </div>
      ) : (
        <>
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{faculties.length}</span>
              <span style={styles.statLabel}>Total Faculties</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>
                {faculties.reduce((total, faculty) => total + (faculty.courses?.length || 0), 0)}
              </span>
              <span style={styles.statLabel}>Total Courses</span>
            </div>
          </div>

          <div style={styles.facultiesGrid}>
            {faculties.map((faculty) => (
              <div key={faculty.id} style={styles.facultyCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.facultyName}>{faculty.name}</h3>
                  <div style={styles.courseBadge}>
                    {faculty.courses?.length || 0} courses
                  </div>
                </div>
                
                <p style={styles.description}>
                  {faculty.description || "No description provided"}
                </p>
                
                <div style={styles.facultyMeta}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Created:</span>
                    <span style={styles.metaValue}>
                      {new Date(faculty.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Last Updated:</span>
                    <span style={styles.metaValue}>
                      {new Date(faculty.updatedAt || faculty.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <Link 
                    to={`/institute/${institutionId}/faculties/${faculty.id}/courses`}
                    style={styles.manageBtn}
                  >
                    Manage Courses
                  </Link>
                  <button
                    style={
                      deleteLoading === faculty.id 
                        ? styles.deleteBtnDisabled 
                        : styles.deleteBtn
                    }
                    onClick={() => handleDelete(faculty.id, faculty.name)}
                    disabled={deleteLoading === faculty.id}
                  >
                    {deleteLoading === faculty.id ? (
                      <div style={styles.buttonContent}>
                        <div style={styles.smallSpinner}></div>
                        Deleting...
                      </div>
                    ) : (
                      "Delete Faculty"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: 1200, 
    margin: "40px auto", 
    padding: "0 20px", 
    fontFamily: "Inter, sans-serif" 
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: "1px solid #e1e5e9"
  },
  headerContent: {
    flex: 1
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
  addBtn: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#1a1a1a",
    color: "#ffffff",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    border: "1px solid #1a1a1a"
  },
  facultiesGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
    gap: 24, 
    marginTop: 24
  },
  facultyCard: { 
    background: "#ffffff", 
    padding: 24, 
    borderRadius: 8, 
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9",
    transition: "all 0.2s ease"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16
  },
  facultyName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 12px 0 0",
    lineHeight: "1.4"
  },
  courseBadge: {
    background: "#f8f9fa",
    color: "#333",
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: "12px",
    fontWeight: "500",
    flexShrink: 0
  },
  description: {
    color: "#666",
    margin: "16px 0",
    minHeight: "48px",
    lineHeight: "1.5",
    fontSize: "14px"
  },
  facultyMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    margin: "20px 0",
    padding: "16px 0",
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0"
  },
  metaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  metaLabel: {
    fontSize: "12px",
    color: "#8c8c8c",
    fontWeight: "500"
  },
  metaValue: {
    fontSize: "12px",
    color: "#333",
    fontWeight: "400"
  },
  cardActions: {
    display: "flex",
    gap: 12,
    marginTop: 16
  },
  manageBtn: {
    flex: 2,
    padding: "10px 16px",
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    borderRadius: 6,
    textDecoration: "none",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  deleteBtn: { 
    flex: 1,
    padding: "10px 16px", 
    background: "#dc2626", 
    color: "#ffffff", 
    borderRadius: 6, 
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  deleteBtnDisabled: { 
    flex: 1,
    padding: "10px 16px", 
    background: "#8c8c8c", 
    color: "#ffffff", 
    borderRadius: 6, 
    cursor: "not-allowed",
    border: "none",
    fontSize: "14px"
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  smallSpinner: {
    width: 14,
    height: 14,
    border: "2px solid transparent",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  statsBar: {
    display: "flex",
    gap: 24,
    marginBottom: 24,
    padding: "20px",
    background: "#fafbfc",
    borderRadius: 8,
    border: "1px solid #e1e5e9"
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a1a"
  },
  statLabel: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "500"
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
  success: { 
    background: "#f0f9ff", 
    padding: "20px", 
    borderRadius: 8, 
    color: "#0369a1", 
    marginBottom: 24,
    border: "1px solid #bae6fd",
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  successIcon: {
    fontSize: "16px",
    flexShrink: 0,
    fontWeight: "bold"
  },
  successContent: {
    flex: 1
  },
  successTitle: {
    display: "block",
    marginBottom: 4,
    fontSize: "14px"
  },
  successMessage: {
    fontSize: "14px",
    opacity: 0.9
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    background: "#fafbfc",
    borderRadius: 12,
    color: "#666",
    border: "2px dashed #e1e5e9"
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 8px 0"
  },
  emptyText: {
    fontSize: "15px",
    margin: "0 0 24px 0",
    lineHeight: "1.5"
  },
  emptyAddBtn: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#1a1a1a",
    color: "#ffffff",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
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

export default ManageFaculties;
