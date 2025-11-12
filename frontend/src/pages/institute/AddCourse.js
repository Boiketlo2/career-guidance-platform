import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const AddCourse = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState({
    name: "",
    facultyId: "",
    description: "",
    requirements: "",
    duration: "",
    credits: 0,
    courseCode: "",
    maxStudents: 0,
    tuitionFee: 0,
    startDate: "",
    applicationDeadline: ""
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [characterCount, setCharacterCount] = useState({ description: 0, requirements: 0 });
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    fetchFaculties();
  }, [institutionId]);

  useEffect(() => {
    calculateFormProgress();
  }, [courseData]);

  const fetchFaculties = async () => {
    try {
      const response = await instituteAPI.getFaculties(institutionId);
      if (response.success) {
        setFaculties(response.faculties || []);
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError("Failed to load faculties");
    }
  };

  const calculateFormProgress = () => {
    const requiredFields = ['name', 'facultyId', 'duration', 'credits', 'courseCode'];
    const optionalFields = ['description', 'requirements', 'maxStudents', 'tuitionFee', 'startDate', 'applicationDeadline'];
    
    let completed = 0;
    requiredFields.forEach(field => {
      if (courseData[field] && courseData[field].toString().trim() !== '') completed++;
    });
    
    optionalFields.forEach(field => {
      if (courseData[field] && courseData[field].toString().trim() !== '') completed++;
    });
    
    const totalFields = requiredFields.length + optionalFields.length;
    const progress = Math.round((completed / totalFields) * 100);
    setFormProgress(progress);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
    
    // Update character count for text areas
    if (name === 'description' || name === 'requirements') {
      setCharacterCount(prev => ({
        ...prev,
        [name]: value.length
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value === '' ? '' : parseInt(value) || 0 });
  };

  const generateCourseCode = () => {
    if (courseData.name && !courseData.courseCode) {
      const words = courseData.name.split(' ');
      const code = words.map(word => word.charAt(0).toUpperCase()).join('') + '101';
      setCourseData(prev => ({ ...prev, courseCode: code }));
    }
  };

  const validateForm = () => {
    if (!courseData.name.trim()) {
      setError("Course name is required");
      return false;
    }
    if (!courseData.facultyId) {
      setError("Please select a faculty");
      return false;
    }
    if (!courseData.courseCode.trim()) {
      setError("Course code is required");
      return false;
    }
    if (courseData.credits <= 0) {
      setError("Credits must be greater than 0");
      return false;
    }
    if (courseData.maxStudents < 0) {
      setError("Maximum students cannot be negative");
      return false;
    }
    if (courseData.tuitionFee < 0) {
      setError("Tuition fee cannot be negative");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...courseData,
        requirements: courseData.requirements ? courseData.requirements.split(',').map(req => req.trim()) : [],
        credits: parseInt(courseData.credits) || 0,
        maxStudents: parseInt(courseData.maxStudents) || 0,
        tuitionFee: parseFloat(courseData.tuitionFee) || 0
      };

      const response = await instituteAPI.addCourse(institutionId, submitData);
      if (response.success) {
        setSuccess("Course added successfully!");
        setTimeout(() => navigate(`/institute/${institutionId}/courses`), 1500);
      } else {
        setError(response.error || "Failed to add course");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "An error occurred while adding the course.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setCourseData({
      name: "",
      facultyId: "",
      description: "",
      requirements: "",
      duration: "",
      credits: 0,
      courseCode: "",
      maxStudents: 0,
      tuitionFee: 0,
      startDate: "",
      applicationDeadline: ""
    });
    setCharacterCount({ description: 0, requirements: 0 });
    setError("");
    setSuccess("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Add New Course</h1>
            <p style={styles.subtitle}>Create a new course offering for your institution</p>
          </div>
          <button
            style={styles.backButton}
            onClick={() => navigate(`/institute/${institutionId}/courses`)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
            ← Back to Courses
          </button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Form Completion</span>
            <span style={styles.progressPercentage}>{formProgress}%</span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${formProgress}%`
              }}
            />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={styles.error}>
            <div style={styles.alertContent}>
              <span style={styles.errorText}>{error}</span>
              <button 
                onClick={() => setError("")}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div style={styles.success}>
            <div style={styles.alertContent}>
              <span style={styles.successText}>{success}</span>
              <span style={styles.successIcon}>✅</span>
            </div>
          </div>
        )}

        {/* Course Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Basic Information */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Basic Information</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Course Name *
                  <span style={styles.required}> *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Computer Science, Business Administration"
                  value={courseData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  disabled={loading}
                  onBlur={generateCourseCode}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Course Code *
                  <span style={styles.required}> *</span>
                </label>
                <input
                  type="text"
                  name="courseCode"
                  placeholder="e.g. CS101, BUS201"
                  value={courseData.courseCode}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  disabled={loading}
                  maxLength="10"
                />
                <div style={styles.helpText}>Auto-generated when you enter course name</div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Faculty *
                  <span style={styles.required}> *</span>
                </label>
                <select
                  name="facultyId"
                  value={courseData.facultyId}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  disabled={loading}
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Course Details</h3>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Duration *
                    <span style={styles.required}> *</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g. 4 years, 2 semesters"
                    value={courseData.duration}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Credits *
                    <span style={styles.required}> *</span>
                  </label>
                  <input
                    type="number"
                    name="credits"
                    value={courseData.credits}
                    onChange={handleNumberChange}
                    required
                    style={styles.input}
                    disabled={loading}
                    min="1"
                    max="200"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Maximum Students</label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={courseData.maxStudents}
                    onChange={handleNumberChange}
                    style={styles.input}
                    disabled={loading}
                    min="0"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tuition Fee (M)</label>
                  <input
                    type="number"
                    name="tuitionFee"
                    value={courseData.tuitionFee}
                    onChange={handleNumberChange}
                    style={styles.input}
                    disabled={loading}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Additional Information</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="Provide a comprehensive overview of the course, learning objectives, and career outcomes..."
                  value={courseData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  disabled={loading}
                  rows="4"
                  maxLength="500"
                />
                <div style={styles.charCount}>
                  {characterCount.description}/500 characters
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Admission Requirements</label>
                <textarea
                  name="requirements"
                  placeholder="Enter specific requirements separated by commas (e.g., LGCSE Mathematics, English Proficiency, Interview)"
                  value={courseData.requirements}
                  onChange={handleChange}
                  style={styles.textarea}
                  disabled={loading}
                  rows="3"
                  maxLength="300"
                />
                <div style={styles.charCount}>
                  {characterCount.requirements}/300 characters
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={courseData.startDate}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Application Deadline</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={courseData.applicationDeadline}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={clearForm}
              disabled={loading}
            >
              Clear Form
            </button>
            <button
              type="submit"
              style={loading ? styles.buttonDisabled : styles.primaryButton}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading && formProgress > 50) {
                  e.target.style.backgroundColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && formProgress > 50) {
                  e.target.style.backgroundColor = '#1a1a1a';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={styles.buttonSpinner}></div>
                  Adding Course...
                </>
              ) : (
                "Add Course"
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div style={styles.helpSection}>
          <h4 style={styles.helpTitle}>💡 Course Creation Tips</h4>
          <ul style={styles.helpList}>
            <li>Ensure course codes are unique and follow your institution's naming convention</li>
            <li>Provide clear, detailed descriptions to attract qualified applicants</li>
            <li>Set realistic admission requirements based on course difficulty</li>
            <li>Consider setting application deadlines to manage intake periods</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f8f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "2rem",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "900px",
    border: "1px solid #e0e0e0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerContent: {
    flex: "1",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: "0",
    lineHeight: "1.5",
  },
  backButton: {
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  progressSection: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #e0e0e0",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  progressLabel: {
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  progressPercentage: {
    color: "#1a1a1a",
    fontWeight: "700",
    fontSize: "1rem",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1a1a1a",
    transition: "width 0.3s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  formGrid: {
    display: "grid",
    gap: "2rem",
  },
  formSection: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 1rem 0",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #e0e0e0",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
  required: {
    color: "#8b2d2d",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    outline: "none",
    backgroundColor: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "0.875rem 1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "80px",
    outline: "none",
    backgroundColor: "#fff",
  },
  charCount: {
    textAlign: "right",
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "0.25rem",
  },
  helpText: {
    fontSize: "0.8rem",
    color: "#666",
    marginTop: "0.25rem",
    fontStyle: "italic",
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: "1rem",
    borderTop: "1px solid #f0f0f0",
  },
  primaryButton: {
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  secondaryButton: {
    background: "transparent",
    color: "#666",
    border: "1px solid #e0e0e0",
    padding: "1rem 2rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "all 0.2s ease",
  },
  buttonDisabled: {
    background: "#f0f0f0",
    color: "#999",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  error: {
    background: "#f8f0f0",
    border: "1px solid #e8d0d0",
    padding: "1rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
  },
  success: {
    background: "#f0f8f0",
    border: "1px solid #d0e8d0",
    padding: "1rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
  },
  alertContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#8b2d2d",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  successText: {
    color: "#2d5a2d",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  successIcon: {
    fontSize: "1rem",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.25rem",
    color: "#8b2d2d",
    cursor: "pointer",
    padding: "0",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  helpSection: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    marginTop: "2rem",
  },
  helpTitle: {
    color: "#1a1a1a",
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 0.75rem 0",
  },
  helpList: {
    margin: "0",
    paddingLeft: "1.25rem",
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.6",
  },
};

export default AddCourse;
