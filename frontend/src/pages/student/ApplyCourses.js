import React, { useEffect, useState } from "react";
import { studentAPI } from "../../api/studentAPI";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ApplyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [personalStatement, setPersonalStatement] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [applying, setApplying] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // "all" or "qualified"

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await studentAPI.getInstitutionsWithCourses();
        if (res.success) {
          setInstitutions(res.institutions);
        } else {
          setError("Failed to load institutions.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading institutions. Please try again.");
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (!selectedInstitution) {
      setCourses([]);
      return;
    }

    setLoadingCourses(true);
    try {
      const selectedInst = institutions.find((inst) => inst.id === selectedInstitution);
      if (selectedInst && selectedInst.faculties?.length > 0) {
        const allCourses = selectedInst.faculties.flatMap((f) => f.courses || []);
        setCourses(allCourses);
        setError("");
      } else {
        setCourses([]);
        setError("No courses found for this institution.");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching courses.");
    } finally {
      setLoadingCourses(false);
    }
  }, [selectedInstitution, institutions]);

  const handleApply = async () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    if (!selectedInstitution || !selectedCourse) {
      setError("Please select both institution and course.");
      return;
    }

    setMessage("");
    setError("");
    setApplying(true);

    try {
      const res = await studentAPI.applyForCourse({
        studentId: user.uid,
        institutionId: selectedInstitution,
        courseId: selectedCourse,
        personalStatement,
      });

      if (res.success) {
        setMessage("Application submitted successfully!");
        setSelectedInstitution("");
        setSelectedCourse("");
        setPersonalStatement("");
      } else {
        setError(res.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      setError("Error submitting application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const getSelectedInstitutionName = () => {
    const inst = institutions.find(inst => inst.id === selectedInstitution);
    return inst ? inst.name : '';
  };

  const getSelectedCourseName = () => {
    const course = courses.find(course => course.id === selectedCourse);
    return course ? course.name : '';
  };

  const handleViewQualifiedCourses = () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    navigate('/qualified-courses');
  };

  const handleSetupAcademicRecords = () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    // Fixed navigation - redirects to student profile with academic tabb
    navigate(`/student/${user.uid}/profile?tab=academic`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Apply for Courses</h2>
        <p style={styles.subtitle}>Explore courses from multiple institutions and submit your applications</p>
      </div>

      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* Course Selection Cards */}
      <div style={styles.selectionCards}>
        <div 
          style={{ 
            ...styles.card, 
            ...(viewMode === "all" ? styles.cardActive : {}),
            cursor: 'pointer'
          }} 
          onClick={() => setViewMode("all")}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3 style={styles.cardTitle}>Browse All Courses</h3>
          <p style={styles.cardDescription}>
            Explore all available courses from all institutions. Apply to any course you're interested in.
          </p>
          <div style={styles.cardBadge}>Current System</div>
        </div>

        <div 
          style={{ 
            ...styles.card, 
            cursor: 'pointer'
          }} 
          onClick={handleViewQualifiedCourses}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3 style={styles.cardTitle}>Show Qualified Courses</h3>
          <p style={styles.cardDescription}>
            See only the courses you qualify for based on your LGCSE grades and subject requirements.
          </p>
          <div style={styles.cardBadgeNew}>New Feature</div>
        </div>
      </div>

      {/* Setup Academic Records */}
      <div style={styles.setupPrompt}>
        <div style={styles.setupContent}>
          <div style={styles.setupTextContent}>
            <h4 style={styles.setupTitle}>First time here?</h4>
            <p style={styles.setupText}>
              To see courses you qualify for, you need to set up your academic records first.
              Add your LGCSE subjects and grades in your profile.
            </p>
          </div>
          <button 
            onClick={handleSetupAcademicRecords} 
            style={styles.setupButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
            Setup Academic Records
          </button>
        </div>
      </div>

      {/* Application Form */}
      {viewMode === "all" && (
        <div style={styles.formCard}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Institution *</label>
            {loadingInstitutions ? (
              <div style={styles.loadingSkeleton}>Loading institutions...</div>
            ) : (
              <select
                style={styles.select}
                value={selectedInstitution}
                onChange={(e) => { setSelectedInstitution(e.target.value); setSelectedCourse(""); }}
              >
                <option value="">-- Select Institution --</option>
                {institutions.map((inst) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
              </select>
            )}
          </div>

          {selectedInstitution && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Course *</label>
              {loadingCourses ? (
                <div style={styles.loadingSkeleton}>Loading courses...</div>
              ) : (
                <select style={styles.select} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.name} - {course.duration || "N/A"}</option>)}
                </select>
              )}
            </div>
          )}

          {selectedCourse && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Personal Statement</label>
              <textarea
                style={styles.textarea}
                value={personalStatement}
                onChange={(e) => setPersonalStatement(e.target.value)}
                placeholder="Tell us why you're interested in this course and why you'd be a great candidate..."
                rows="5"
                maxLength="500"
              />
              <div style={styles.charCount}>{personalStatement.length}/500 characters</div>
            </div>
          )}

          {(selectedInstitution && selectedCourse) && (
            <div style={styles.summary}>
              <h4 style={styles.summaryTitle}>Application Summary</h4>
              <div style={styles.summaryItem}><strong>Institution:</strong> {getSelectedInstitutionName()}</div>
              <div style={styles.summaryItem}><strong>Course:</strong> {getSelectedCourseName()}</div>
            </div>
          )}

          {/* Submit Application Button Removed - Students can only browse without applying */}
        </div>
      )}

      {/* Info Box */}
      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>Application Guidelines</h4>
        <ul style={styles.infoList}>
          <li>You can apply for maximum 2 courses per institution</li>
          <li>Ensure all information is accurate before submitting</li>
          <li>You will receive admission results via email and dashboard</li>
          <li>Contact institution directly for specific course requirements</li>
          <li><strong>New:</strong> Set up your academic records to see only courses you qualify for</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: "1000px", 
    margin: "2rem auto", 
    padding: "0 1.25rem", 
    fontFamily: "'Inter', 'Segoe UI', sans-serif" 
  },
  header: { 
    textAlign: "center", 
    marginBottom: "2.5rem", 
    padding: "2rem", 
    borderRadius: "8px", 
    backgroundColor: "#fff", 
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" 
  },
  title: { 
    fontSize: "2rem", 
    fontWeight: "700", 
    color: "#1a1a1a", 
    marginBottom: "0.75rem" 
  },
  subtitle: { 
    fontSize: "1.1rem", 
    color: "#666", 
    fontWeight: "400",
    margin: "0" 
  },
  selectionCards: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
    gap: "1.5rem", 
    marginBottom: "2.5rem" 
  },
  card: { 
    background: "#fff", 
    padding: "2rem", 
    borderRadius: "8px", 
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", 
    border: "1px solid #e0e0e0", 
    cursor: "pointer", 
    transition: "all 0.2s ease", 
    position: "relative", 
    overflow: "hidden" 
  },
  cardActive: {
    border: "2px solid #1a1a1a",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
  },
  cardTitle: { 
    fontSize: "1.25rem", 
    fontWeight: "600", 
    color: "#1a1a1a", 
    marginBottom: "0.75rem" 
  },
  cardDescription: { 
    color: "#666", 
    lineHeight: "1.6", 
    fontSize: "0.9rem",
    margin: "0" 
  },
  cardBadge: { 
    position: "absolute", 
    top: "1rem", 
    right: "1rem", 
    background: "#666", 
    color: "white", 
    padding: "0.25rem 0.75rem", 
    borderRadius: "12px", 
    fontSize: "0.75rem", 
    fontWeight: "600" 
  },
  cardBadgeNew: { 
    position: "absolute", 
    top: "1rem", 
    right: "1rem", 
    background: "#1a1a1a", 
    color: "white", 
    padding: "0.25rem 0.75rem", 
    borderRadius: "12px", 
    fontSize: "0.75rem", 
    fontWeight: "600" 
  },
  setupPrompt: { 
    background: "#f8f8f8", 
    border: "1px solid #e0e0e0", 
    borderRadius: "8px", 
    padding: "1.5rem", 
    marginBottom: "2rem" 
  },
  setupContent: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    gap: "1.5rem" 
  },
  setupTextContent: {
    flex: "1"
  },
  setupTitle: { 
    margin: "0 0 0.5rem 0", 
    color: "#1a1a1a", 
    fontSize: "1.1rem",
    fontWeight: "600" 
  },
  setupText: { 
    margin: "0", 
    color: "#666", 
    fontSize: "0.9rem", 
    lineHeight: "1.5" 
  },
  setupButton: { 
    padding: "0.75rem 1.5rem", 
    background: "#1a1a1a", 
    color: "white", 
    border: "none", 
    borderRadius: "6px", 
    cursor: "pointer", 
    fontWeight: "600", 
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap"
  },
  formCard: { 
    background: "#fff", 
    padding: "2.5rem", 
    borderRadius: "8px", 
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", 
    border: "1px solid #e0e0e0", 
    marginBottom: "2rem" 
  },
  formGroup: { 
    marginBottom: "1.5rem" 
  },
  label: { 
    display: "block", 
    fontWeight: "600", 
    marginBottom: "0.5rem", 
    color: "#1a1a1a", 
    fontSize: "0.95rem" 
  },
  select: { 
    width: "100%", 
    padding: "0.875rem 1rem", 
    fontSize: "0.95rem", 
    borderRadius: "6px", 
    border: "1px solid #e0e0e0", 
    backgroundColor: "#fff", 
    outline: "none",
    transition: "border 0.2s ease"
  },
  textarea: { 
    width: "100%", 
    padding: "1rem", 
    borderRadius: "6px", 
    border: "1px solid #e0e0e0", 
    fontSize: "0.95rem", 
    resize: "vertical", 
    minHeight: "120px", 
    outline: "none", 
    fontFamily: "inherit",
    transition: "border 0.2s ease"
  },
  charCount: { 
    textAlign: "right", 
    fontSize: "0.8rem", 
    color: "#999", 
    marginTop: "0.5rem" 
  },
  button: { 
    width: "100%", 
    padding: "1rem", 
    borderRadius: "6px", 
    border: "none", 
    fontSize: "1rem", 
    fontWeight: "600", 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: "0.5rem",
    transition: "all 0.2s ease"
  },
  buttonActive: { 
    background: "#1a1a1a", 
    color: "#fff" 
  },
  buttonDisabled: { 
    background: "#f0f0f0", 
    color: "#999", 
    cursor: "not-allowed" 
  },
  summary: { 
    background: "#f8f8f8", 
    padding: "1.5rem", 
    borderRadius: "6px", 
    border: "1px solid #e0e0e0", 
    marginBottom: "1.5rem" 
  },
  summaryTitle: { 
    margin: "0 0 1rem 0", 
    color: "#1a1a1a", 
    fontSize: "1.1rem",
    fontWeight: "600" 
  },
  summaryItem: { 
    marginBottom: "0.5rem", 
    color: "#666",
    fontSize: "0.95rem" 
  },
  infoBox: { 
    background: "#fff", 
    padding: "1.5rem", 
    borderRadius: "8px", 
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" 
  },
  infoTitle: { 
    margin: "0 0 1rem 0", 
    color: "#1a1a1a", 
    fontSize: "1.1rem",
    fontWeight: "600" 
  },
  infoList: { 
    margin: "0", 
    paddingLeft: "1.25rem", 
    color: "#666", 
    lineHeight: "1.6",
    fontSize: "0.9rem" 
  },
  loadingSkeleton: { 
    padding: "0.875rem 1rem", 
    backgroundColor: "#f8f8f8", 
    border: "1px solid #e0e0e0", 
    borderRadius: "6px", 
    color: "#999", 
    textAlign: "center",
    fontSize: "0.9rem" 
  },
  successMessage: { 
    background: "#f0f8f0", 
    color: "#2d5a2d", 
    padding: "1rem 1.25rem", 
    borderRadius: "6px", 
    marginBottom: "1.5rem",
    border: "1px solid #d0e8d0",
    fontSize: "0.95rem"
  },
  errorMessage: { 
    background: "#f8f0f0", 
    color: "#8b2d2d", 
    padding: "1rem 1.25rem", 
    borderRadius: "6px", 
    marginBottom: "1.5rem",
    border: "1px solid #e8d0d0",
    fontSize: "0.95rem"
  },
};

export default ApplyCourses;
