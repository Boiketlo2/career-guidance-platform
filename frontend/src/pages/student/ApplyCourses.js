import React, { useEffect, useState } from "react";
import { studentAPI } from "../../api/studentAPI";
import { useAuth } from "../../context/AuthContext";

const ApplyCourses = () => {
  const { user } = useAuth();

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

  // Fetch all institutions with courses
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

  // Extract courses from selected institution
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

  // Apply for a course
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
        setMessage("🎉 Application submitted successfully!");
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Apply for Courses</h2>
        <p style={styles.subtitle}>Discover and apply to courses from various institutions</p>
      </div>

      {message && (
        <div style={styles.successMessage}>
          <span style={styles.successIcon}>✓</span>
          {message}
        </div>
      )}
      
      {error && (
        <div style={styles.errorMessage}>
          <span style={styles.errorIcon}>⚠</span>
          {error}
        </div>
      )}

      <div style={styles.formCard}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Select Institution *</label>
          {loadingInstitutions ? (
            <div style={styles.loadingSkeleton}>Loading institutions...</div>
          ) : (
            <select
              style={styles.select}
              value={selectedInstitution}
              onChange={(e) => {
                setSelectedInstitution(e.target.value);
                setSelectedCourse("");
              }}
            >
              <option value="">-- Select Institution --</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedInstitution && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Course *</label>
            {loadingCourses ? (
              <div style={styles.loadingSkeleton}>Loading courses...</div>
            ) : (
              <select
                style={styles.select}
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} - {course.duration || "N/A"}
                  </option>
                ))}
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
            />
            <div style={styles.charCount}>
              {personalStatement.length}/500 characters
            </div>
          </div>
        )}

        {(selectedInstitution && selectedCourse) && (
          <div style={styles.summary}>
            <h4 style={styles.summaryTitle}>Application Summary</h4>
            <div style={styles.summaryItem}>
              <strong>Institution:</strong> {getSelectedInstitutionName()}
            </div>
            <div style={styles.summaryItem}>
              <strong>Course:</strong> {getSelectedCourseName()}
            </div>
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={!selectedInstitution || !selectedCourse || applying}
          style={{
            ...styles.button,
            ...((selectedInstitution && selectedCourse && !applying)
              ? styles.buttonActive
              : styles.buttonDisabled),
          }}
        >
          {applying ? (
            <>
              <div style={styles.spinner}></div>
              Submitting Application...
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>

      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>📝 Application Guidelines</h4>
        <ul style={styles.infoList}>
          <li>You can apply for maximum 2 courses per institution</li>
          <li>Ensure all information is accurate before submitting</li>
          <li>You will receive admission results via email and dashboard</li>
          <li>Contact institution directly for specific course requirements</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    padding: "0 20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    fontWeight: "400",
  },
  formCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    marginBottom: "30px",
  },
  formGroup: {
    marginBottom: "30px",
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#2d3748",
    fontSize: "1rem",
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "16px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    resize: "vertical",
    minHeight: "120px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
  },
  charCount: {
    textAlign: "right",
    fontSize: "12px",
    color: "#a0aec0",
    marginTop: "5px",
  },
  button: {
    width: "100%",
    padding: "16px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  buttonActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  buttonDisabled: {
    background: "#cbd5e0",
    color: "#718096",
    cursor: "not-allowed",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid transparent",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
  },
  successMessage: {
    background: "linear-gradient(135deg, #48bb78, #38a169)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 15px rgba(72, 187, 120, 0.3)",
  },
  errorMessage: {
    background: "linear-gradient(135deg, #f56565, #e53e3e)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 15px rgba(245, 101, 101, 0.3)",
  },
  successIcon: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  errorIcon: {
    fontSize: "18px",
  },
  loadingSkeleton: {
    padding: "14px 16px",
    backgroundColor: "#f7fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    color: "#a0aec0",
    textAlign: "center",
  },
  summary: {
    background: "#f7fafc",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    marginBottom: "25px",
  },
  summaryTitle: {
    margin: "0 0 15px 0",
    color: "#2d3748",
    fontSize: "1.1rem",
  },
  summaryItem: {
    marginBottom: "8px",
    color: "#4a5568",
  },
  infoBox: {
    background: "linear-gradient(135deg, #fff, #f7fafc)",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  infoTitle: {
    margin: "0 0 15px 0",
    color: "#2d3748",
    fontSize: "1.1rem",
  },
  infoList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#4a5568",
    lineHeight: "1.6",
  },
};

export default ApplyCourses;