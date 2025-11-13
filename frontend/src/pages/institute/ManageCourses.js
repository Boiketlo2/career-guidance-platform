import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const ManageCourses = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, [institutionId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await instituteAPI.getCourses(institutionId);
      if (response.success) {
        setCourses(response.courses || []);
      } else {
        setError(response.error || "Failed to load courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.error || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await instituteAPI.getFaculties(institutionId);
      if (response.success) {
        setFaculties(response.faculties || []);
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
    }
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : "Unknown Faculty";
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This will permanently remove the course and all associated data.`)) return;
    
    try {
      setDeleteLoading(courseId);
      setError("");
      setSuccess("");
      
      // Assuming deleteCourse is implemented in your API
      const response = await instituteAPI.deleteCourse(institutionId, courseId);
      
      if (response.success) {
        setSuccess(`Course "${courseName}" deleted successfully!`);
        setCourses(prev => prev.filter(c => c.id !== courseId));
      } else {
        setError(response.error || "Failed to delete course");
      }
    } catch (err) {
      console.error("Delete course error:", err);
      setError(err.response?.data?.error || "Failed to delete course");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Courses...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Manage Courses</h1>
          <p style={styles.subtitle}>Create and manage courses across your faculties</p>
        </div>
        <div style={styles.headerActions}>
          <Link to={`/institute/${institutionId}`} style={styles.secondaryBtn}>
            ← Back to Dashboard
          </Link>
          <Link to={`/institute/${institutionId}/courses/add`} style={styles.primaryBtn}>
            + Add New Course
          </Link>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
          <button onClick={fetchCourses} style={styles.retryBtn}>
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

      {courses.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
          <h3 style={styles.emptyTitle}>No Courses Found</h3>
          <p style={styles.emptyText}>Start by creating your first course for your institution.</p>
          <Link to={`/institute/${institutionId}/courses/add`} style={styles.emptyPrimaryBtn}>
            + Add Your First Course
          </Link>
        </div>
      ) : (
        <>
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{courses.length}</span>
              <span style={styles.statLabel}>Total Courses</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>
                {new Set(courses.map(course => course.facultyId)).size}
              </span>
              <span style={styles.statLabel}>Faculties</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>
                {courses.filter(course => course.status === 'active').length}
              </span>
              <span style={styles.statLabel}>Active Courses</span>
            </div>
          </div>

          <div style={styles.coursesGrid}>
            {courses.map(course => (
              <div key={course.id} style={styles.courseCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.courseName}>{course.name}</h3>
                  <span style={course.status === 'active' ? styles.activeBadge : styles.inactiveBadge}>
                    {course.status || 'active'}
                  </span>
                </div>
                
                <div style={styles.courseDetails}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Faculty:</span>
                    <span style={styles.detailValue}>{getFacultyName(course.facultyId)}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Duration:</span>
                    <span style={styles.detailValue}>{course.duration || "Not specified"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Credits:</span>
                    <span style={styles.detailValue}>{course.credits || 0}</span>
                  </div>
                </div>

                {course.description && (
                  <div style={styles.description}>
                    <strong style={styles.descriptionLabel}>Description:</strong>
                    <p style={styles.descriptionText}>{course.description}</p>
                  </div>
                )}

                {course.requirements && course.requirements.length > 0 && (
                  <div style={styles.requirements}>
                    <strong style={styles.requirementsLabel}>Requirements:</strong>
                    <div style={styles.requirementsList}>
                      {course.requirements.map((req, index) => (
                        <span key={index} style={styles.requirementTag}>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.courseActions}>
                  <button
                    onClick={() => handleDeleteCourse(course.id, course.name)}
                    style={
                      deleteLoading === course.id 
                        ? styles.deleteBtnDisabled 
                        : styles.deleteBtn
                    }
                    disabled={deleteLoading === course.id}
                  >
                    {deleteLoading === course.id ? (
                      <div style={styles.buttonContent}>
                        <div style={styles.smallSpinner}></div>
                        Deleting...
                      </div>
                    ) : (
                      "Delete Course"
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
  headerActions: {
    display: "flex",
    gap: 12,
    alignItems: "center"
  },
  primaryBtn: {
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
  secondaryBtn: {
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "12px 24px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease"
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: 24
  },
  courseCard: {
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
  courseName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 12px 0 0",
    lineHeight: "1.4",
    flex: 1
  },
  courseDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  detailLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500"
  },
  detailValue: {
    fontSize: "14px",
    color: "#1a1a1a",
    fontWeight: "400"
  },
  description: {
    marginBottom: 16,
    padding: "12px 0",
    borderTop: "1px solid #f0f0f0"
  },
  descriptionLabel: {
    fontSize: "14px",
    color: "#333",
    marginBottom: 4,
    display: "block"
  },
  descriptionText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.5",
    margin: 0
  },
  requirements: {
    marginBottom: 16,
    padding: "12px 0",
    borderTop: "1px solid #f0f0f0"
  },
  requirementsLabel: {
    fontSize: "14px",
    color: "#333",
    marginBottom: 8,
    display: "block"
  },
  requirementsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6
  },
  requirementTag: {
    background: "#f8f9fa",
    color: "#333",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: "12px",
    fontWeight: "400"
  },
  courseActions: {
    display: "flex",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #f0f0f0"
  },
  deleteBtn: {
    padding: "12px 16px",
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    width: "100%"
  },
  deleteBtnDisabled: {
    padding: "12px 16px",
    background: "#8c8c8c",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    cursor: "not-allowed",
    fontSize: "14px",
    width: "100%"
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
  activeBadge: {
    background: "#f0f9f0",
    color: "#0f7a0f",
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #e1f5e1"
  },
  inactiveBadge: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #fecaca"
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
  emptyPrimaryBtn: {
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

export default ManageCourses;
