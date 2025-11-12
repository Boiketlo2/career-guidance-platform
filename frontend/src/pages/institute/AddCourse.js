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
    credits: 0
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFaculties();
  }, [institutionId]);

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

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const submitData = {
        ...courseData,
        requirements: courseData.requirements ? courseData.requirements.split(',').map(req => req.trim()) : [],
        credits: parseInt(courseData.credits) || 0
      };

      const response = await instituteAPI.addCourse(institutionId, submitData);
      if (response.success) {
        setSuccess("✅ Course added successfully!");
        setTimeout(() => navigate(`/institute/${institutionId}/courses`), 1200);
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}> Add New Course</h1>
          <button
            style={styles.backButton}
            onClick={() => navigate(`/institute/${institutionId}/courses`)}
          >
            ← Back to Courses
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Course Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Computer Science"
              value={courseData.name}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Faculty *</label>
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

          <div style={styles.formGroup}>
            <label style={styles.label}>Duration *</label>
            <input
              type="text"
              name="duration"
              placeholder="e.g. 4 years"
              value={courseData.duration}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Credits *</label>
            <input
              type="number"
              name="credits"
              value={courseData.credits}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={loading}
              min="0"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              placeholder="Brief overview of the course"
              value={courseData.description}
              onChange={handleChange}
              style={styles.textarea}
              disabled={loading}
              rows="3"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Requirements</label>
            <textarea
              name="requirements"
              placeholder="Enter requirements separated by commas (optional)"
              value={courseData.requirements}
              onChange={handleChange}
              style={styles.textarea}
              disabled={loading}
              rows="2"
            />
          </div>

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Adding Course..." : "Add Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f9fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "600px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: 0
  },
  backButton: {
    background: "transparent",
    color: "#007bff",
    border: "1px solid #007bff",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "none"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontWeight: "600",
    color: "#333",
    fontSize: "14px"
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "60px",
    boxSizing: "border-box"
  },
  primaryButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    marginTop: "10px"
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontSize: "16px",
    marginTop: "10px"
  },
  error: {
    backgroundColor: "#fdecea",
    color: "#d93025",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb"
  },
  success: {
    backgroundColor: "#e6f7e6",
    color: "#0a730a",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    border: "1px solid #c3e6c3"
  }
};

export default AddCourse;
