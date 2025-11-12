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
    navigate(`/profile/${user.uid}?tab=academic`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Apply for Courses</h2>
        <p style={styles.subtitle}>Explore courses from multiple institutions and apply easily</p>
      </div>

      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* Course Selection Cards */}
      <div style={styles.selectionCards}>
        <div style={styles.card} onClick={() => setViewMode("all")}>
          <h3 style={styles.cardTitle}>Browse All Courses</h3>
          <p style={styles.cardDescription}>
            Explore all available courses from all institutions. Apply to any course you're interested in.
          </p>
          <div style={styles.cardBadge}>Current System</div>
        </div>

        <div style={styles.card} onClick={handleViewQualifiedCourses}>
          <h3 style={styles.cardTitle}>Show Qualified Courses</h3>
          <p style={styles.cardDescription}>
            See only the courses you qualify for based on your LGCSE grades and subject requirements.
          </p>
          <div style={styles.cardBadge}>New Feature</div>
        </div>
      </div>

      {/* Setup Academic Records */}
      <div style={styles.setupPrompt}>
        <div style={styles.setupContent}>
          <div>
            <h4 style={styles.setupTitle}>First time here?</h4>
            <p style={styles.setupText}>
              To see courses you qualify for, you need to set up your academic records first.
              Add your LGCSE subjects and grades in your profile.
            </p>
            <button onClick={handleSetupAcademicRecords} style={styles.setupButton}>
              Setup Academic Records
            </button>
          </div>
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

          <button
            onClick={handleApply}
            disabled={!selectedInstitution || !selectedCourse || applying}
            style={{ ...styles.button, ...((selectedInstitution && selectedCourse && !applying) ? styles.buttonActive : styles.buttonDisabled) }}
          >
            {applying ? "Submitting Application..." : "Submit Application"}
          </button>
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
  container: { maxWidth: "1000px", margin: "30px auto", padding: "0 20px", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: "40px", padding: "20px", borderRadius: "12px", backgroundColor: "#f7fafc", border: "1px solid #e2e8f0" },
  title: { fontSize: "2.5rem", fontWeight: "700", color: "#2d3748", marginBottom: "10px" },
  subtitle: { fontSize: "1.1rem", color: "#4a5568", fontWeight: "400" },
  selectionCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "40px" },
  card: { background: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.3s ease", position: "relative", overflow: "hidden" },
  cardTitle: { fontSize: "1.3rem", fontWeight: "600", color: "#2d3748", marginBottom: "12px" },
  cardDescription: { color: "#4a5568", lineHeight: "1.6", fontSize: "14px" },
  cardBadge: { position: "absolute", top: "15px", right: "15px", background: "#667eea", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  setupPrompt: { background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "30px" },
  setupContent: { display: "flex", alignItems: "center", gap: "20px" },
  setupTitle: { margin: "0 0 8px 0", color: "#2d3748", fontSize: "1.1rem" },
  setupText: { margin: "0", color: "#4a5568", fontSize: "14px", flex: "1" },
  setupButton: { padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  formCard: { background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", marginBottom: "30px" },
  formGroup: { marginBottom: "30px" },
  label: { display: "block", fontWeight: "600", marginBottom: "12px", color: "#2d3748", fontSize: "1rem" },
  select: { width: "100%", padding: "14px 16px", fontSize: "16px", borderRadius: "10px", border: "2px solid #e2e8f0", backgroundColor: "#fff", outline: "none" },
  textarea: { width: "100%", padding: "16px", borderRadius: "10px", border: "2px solid #e2e8f0", fontSize: "15px", resize: "vertical", minHeight: "120px", outline: "none", fontFamily: "inherit" },
  charCount: { textAlign: "right", fontSize: "12px", color: "#718096", marginTop: "5px" },
  button: { width: "100%", padding: "16px", borderRadius: "10px", border: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  buttonActive: { background: "#667eea", color: "#fff" },
  buttonDisabled: { background: "#cbd5e0", color: "#718096", cursor: "not-allowed" },
  summary: { background: "#f7fafc", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "25px" },
  summaryTitle: { margin: "0 0 15px 0", color: "#2d3748", fontSize: "1.1rem" },
  summaryItem: { marginBottom: "8px", color: "#4a5568" },
  infoBox: { background: "#f7fafc", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0" },
  infoTitle: { margin: "0 0 15px 0", color: "#2d3748", fontSize: "1.1rem" },
  infoList: { margin: "0", paddingLeft: "20px", color: "#4a5568", lineHeight: "1.6" },
  loadingSkeleton: { padding: "14px 16px", backgroundColor: "#f7fafc", border: "2px solid #e2e8f0", borderRadius: "10px", color: "#a0aec0", textAlign: "center" },
  successMessage: { background: "#48bb78", color: "#fff", padding: "16px 20px", borderRadius: "10px", marginBottom: "25px" },
  errorMessage: { background: "#f56565", color: "#fff", padding: "16px 20px", borderRadius: "10px", marginBottom: "25px" },
};

export default ApplyCourses;
