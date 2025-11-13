import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { studentAPI } from "../../api/studentAPI";

const QualifiedCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [qualifiedCourses, setQualifiedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [personalStatement, setPersonalStatement] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalQualified: 0,
    totalChecked: 0,
    studentSubjectsCount: 0
  });

  useEffect(() => {
    if (user) {
      fetchQualifiedCourses();
    }
  }, [user]);

  const fetchQualifiedCourses = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching qualified courses for student:", user.uid);
      
      const res = await studentAPI.getQualifiedCourses(user.uid);
      console.log("Qualified courses response:", res);
      
      if (res.success) {
        setQualifiedCourses(res.qualifiedCourses || []);
        setStats({
          totalQualified: res.totalQualified || 0,
          totalChecked: res.totalChecked || 0,
          studentSubjectsCount: res.studentSubjectsCount || 0
        });
        
        if (res.qualifiedCourses.length === 0) {
          if (res.studentSubjectsCount === 0) {
            setError("No academic records found. Please set up your LGCSE subjects and grades first.");
          } else {
            setMessage("No courses found that match your qualifications. Try browsing all courses instead.");
          }
        }
      } else {
        setError(res.error || "Failed to load qualified courses");
      }
    } catch (err) {
      console.error("Error fetching qualified courses:", err);
      setError("Failed to load qualified courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (course) => {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    setSelectedCourse(course);
    setPersonalStatement("");
    setMessage("");
    setError("");
  };

  const submitApplication = async () => {
    if (!selectedCourse || !personalStatement.trim()) {
      setError("Please provide a personal statement.");
      return;
    }

    setApplying(true);
    setError("");

    try {
      const res = await studentAPI.applyForCourse({
        studentId: user.uid,
        institutionId: selectedCourse.institutionId,
        courseId: selectedCourse.id,
        personalStatement: personalStatement.trim()
      });

      if (res.success) {
        setMessage(`Application submitted successfully for ${selectedCourse.name}!`);
        setSelectedCourse(null);
        setPersonalStatement("");
        // Refresh to update any application limits
        await fetchQualifiedCourses();
      } else {
        setError(res.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Error applying for course:", err);
      setError("Error submitting application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setPersonalStatement("");
    setError("");
  };

  const handleSetupAcademicRecords = () => {
    navigate(`/profile/${user.uid}?tab=academic`);
  };

  const handleBrowseAllCourses = () => {
    navigate("/apply-courses");
  };

  const getRequirementText = (requirements) => {
    if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
      return "No specific requirements";
    }
    
    return requirements.join(", ");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Finding courses that match your qualifications...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Courses You Qualify For</h1>
          <p style={styles.subtitle}>
            Based on your LGCSE subjects and grades
          </p>
          
          {/* Stats Cards */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.totalQualified}</div>
              <div style={styles.statLabel}>Qualified Courses</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.totalChecked}</div>
              <div style={styles.statLabel}>Total Courses Checked</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.studentSubjectsCount}</div>
              <div style={styles.statLabel}>Your Subjects</div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div style={styles.successMessage}>
          {message}
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          {error}
          {error.includes("No academic records") && (
            <button 
              onClick={handleSetupAcademicRecords}
              style={styles.inlineButton}
            >
              Setup Academic Records
            </button>
          )}
          {error.includes("No courses found") && (
            <button 
              onClick={handleBrowseAllCourses}
              style={styles.inlineButton}
            >
              Browse All Courses
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionBar}>
        <button 
          onClick={handleBrowseAllCourses}
          style={styles.secondaryButton}
        >
          ← Browse All Courses
        </button>
        <button 
          onClick={handleSetupAcademicRecords}
          style={styles.secondaryButton}
        >
          Update Academic Records
        </button>
        <button 
          onClick={fetchQualifiedCourses}
          style={styles.refreshButton}
        >
          ↻ Refresh Results
        </button>
      </div>

      {/* Courses Grid */}
      {qualifiedCourses.length > 0 && (
        <div style={styles.coursesGrid}>
          {qualifiedCourses.map((course) => (
            <div key={course.id} style={styles.courseCard}>
              <div style={styles.courseHeader}>
                <h3 style={styles.courseName}>{course.name}</h3>
                <div style={styles.courseBadge}>Qualified ✓</div>
              </div>
              
              <div style={styles.courseDetails}>
                <div style={styles.detailItem}>
                  <strong>Institution:</strong> {course.institution}
                </div>
                <div style={styles.detailItem}>
                  <strong>Faculty:</strong> {course.faculty}
                </div>
                {course.duration && (
                  <div style={styles.detailItem}>
                    <strong>Duration:</strong> {course.duration}
                  </div>
                )}
                {course.requirements && course.requirements.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>Requirements:</strong> 
                    <span style={styles.requirements}>
                      {getRequirementText(course.requirements)}
                    </span>
                  </div>
                )}
                {course.description && (
                  <div style={styles.courseDescription}>
                    {course.description}
                  </div>
                )}
              </div>

              <div style={styles.courseActions}>
                <button 
                  onClick={() => handleApply(course)}
                  style={styles.applyButton}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Courses Message */}
      {qualifiedCourses.length === 0 && !loading && !error && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}></div>
          <h3 style={styles.emptyTitle}>No Qualified Courses Found</h3>
          <p style={styles.emptyText}>
            We couldn't find any courses that match your current qualifications. 
            This could be because:
          </p>
          <ul style={styles.emptyList}>
            <li>Your grades don't meet the minimum requirements for available courses</li>
            <li>You need to add more subjects to your academic records</li>
            <li>There might be limited courses in your preferred field</li>
          </ul>
          <div style={styles.emptyActions}>
            <button 
              onClick={handleBrowseAllCourses}
              style={styles.primaryButton}
            >
              Browse All Courses
            </button>
            <button 
              onClick={handleSetupAcademicRecords}
              style={styles.secondaryButton}
            >
              Update Academic Records
            </button>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {selectedCourse && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Apply for {selectedCourse.name}</h2>
              <button onClick={closeModal} style={styles.closeButton}>×</button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.courseSummary}>
                <strong>Institution:</strong> {selectedCourse.institution}<br />
                <strong>Faculty:</strong> {selectedCourse.faculty}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Personal Statement *</label>
                <textarea
                  style={styles.textarea}
                  value={personalStatement}
                  onChange={(e) => setPersonalStatement(e.target.value)}
                  placeholder="Tell us why you're interested in this course and why you'd be a great candidate..."
                  rows="6"
                  maxLength="500"
                />
                <div style={styles.charCount}>
                  {personalStatement.length}/500 characters
                </div>
              </div>

              {error && (
                <div style={styles.errorMessage}>{error}</div>
              )}
            </div>

            <div style={styles.modalActions}>
              <button 
                onClick={closeModal}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={submitApplication}
                disabled={applying || !personalStatement.trim()}
                style={{
                  ...styles.submitButton,
                  ...((!personalStatement.trim() || applying) ? styles.buttonDisabled : {})
                }}
              >
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    color: "white",
    padding: "3rem 2rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    textAlign: "center",
  },
  headerContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 1rem 0",
  },
  subtitle: {
    fontSize: "1.2rem",
    opacity: 0.9,
    margin: "0 0 2rem 0",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    flexWrap: "wrap",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "1.5rem",
    borderRadius: "8px",
    minWidth: "140px",
    backdropFilter: "blur(10px)",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "0.9rem",
    opacity: 0.8,
  },
  actionBar: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  secondaryButton: {
    padding: "0.75rem 1.5rem",
    border: "2px solid #1a1a1a",
    background: "transparent",
    color: "#1a1a1a",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  refreshButton: {
    padding: "0.75rem 1.5rem",
    background: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  primaryButton: {
    padding: "1rem 2rem",
    background: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.2s ease",
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  courseCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  },
  courseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  courseName: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
    flex: 1,
  },
  courseBadge: {
    background: "#2d5a2d",
    color: "white",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
    marginLeft: "1rem",
  },
  courseDetails: {
    marginBottom: "1.5rem",
  },
  detailItem: {
    marginBottom: "0.5rem",
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  requirements: {
    display: "block",
    fontSize: "0.85rem",
    color: "#888",
    marginTop: "0.25rem",
    fontStyle: "italic",
  },
  courseDescription: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #f0f0f0",
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.5",
  },
  courseActions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  applyButton: {
    padding: "0.75rem 1.5rem",
    background: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 1rem 0",
  },
  emptyText: {
    color: "#666",
    fontSize: "1rem",
    margin: "0 0 1.5rem 0",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  emptyList: {
    textAlign: "left",
    color: "#666",
    maxWidth: "400px",
    margin: "0 auto 2rem auto",
    paddingLeft: "1.5rem",
  },
  emptyActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: "#fff",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e0e0e0",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#666",
    padding: "0",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    padding: "2rem",
  },
  courseSummary: {
    background: "#f8f8f8",
    padding: "1rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    color: "#666",
    fontSize: "0.9rem",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#1a1a1a",
  },
  textarea: {
    width: "100%",
    padding: "1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "0.95rem",
    resize: "vertical",
    minHeight: "120px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border 0.2s ease",
  },
  charCount: {
    textAlign: "right",
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "0.5rem",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    padding: "1.5rem 2rem",
    borderTop: "1px solid #e0e0e0",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    border: "2px solid #e0e0e0",
    background: "transparent",
    color: "#666",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  submitButton: {
    padding: "0.75rem 1.5rem",
    background: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  buttonDisabled: {
    background: "#f0f0f0",
    color: "#999",
    cursor: "not-allowed",
  },
  successMessage: {
    background: "#f0f8f0",
    color: "#2d5a2d",
    padding: "1rem 1.25rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #d0e8d0",
  },
  errorMessage: {
    background: "#f8f0f0",
    color: "#8b2d2d",
    padding: "1rem 1.25rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #e8d0d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  inlineButton: {
    background: "transparent",
    color: "#8b2d2d",
    border: "1px solid #8b2d2d",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    color: "#666",
  },
  loadingText: {
    marginTop: "1rem",
    fontSize: "1.1rem",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #1a1a1a",
    borderRadius: "50%",
  },
};
export default QualifiedCourses;
