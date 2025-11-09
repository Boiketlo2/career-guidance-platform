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

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, [institutionId]);

  const fetchCourses = async () => {
    try {
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
    if (!window.confirm(`Are you sure you want to delete "${courseName}"?`)) return;
    
    try {
      // Note: You'll need to implement deleteCourse in your API
      alert("Delete functionality to be implemented in API");
      // For now, just remove from local state
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete course.");
    }
  };

  if (loading) return <div style={styles.loading}>Loading courses...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Manage Courses</h1>
        <div>
          <Link to={`/institute/${institutionId}`} style={styles.secondaryBtn}>
            ⬅ Back to Dashboard
          </Link>
          <Link to={`/institute/${institutionId}/courses/add`} style={styles.primaryBtn}>
            ➕ Add Course
          </Link>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={fetchCourses} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {courses.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No courses found. Add your first one!</p>
          <Link to={`/institute/${institutionId}/courses/add`} style={styles.primaryBtn}>
            ➕ Add Your First Course
          </Link>
        </div>
      ) : (
        <div style={styles.coursesGrid}>
          {courses.map(course => (
            <div key={course.id} style={styles.courseCard}>
              <h3>{course.name}</h3>
              <p><strong>Faculty:</strong> {getFacultyName(course.facultyId)}</p>
              <p><strong>Duration:</strong> {course.duration || "Not specified"}</p>
              <p><strong>Credits:</strong> {course.credits || 0}</p>
              <p><strong>Status:</strong> 
                <span style={course.status === 'active' ? styles.activeBadge : styles.inactiveBadge}>
                  {course.status || 'active'}
                </span>
              </p>
              {course.description && (
                <p><strong>Description:</strong> {course.description}</p>
              )}
              {course.requirements && course.requirements.length > 0 && (
                <p><strong>Requirements:</strong> {course.requirements.join(', ')}</p>
              )}
              <div style={styles.courseActions}>
                <button
                  onClick={() => handleDeleteCourse(course.id, course.name)}
                  style={styles.deleteBtn}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: "40px auto",
    padding: 20,
    fontFamily: "Inter, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    flexWrap: "wrap",
    gap: 15
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: 20
  },
  courseCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef"
  },
  primaryBtn: {
    background: "#007bff",
    color: "white",
    padding: "10px 20px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px"
  },
  secondaryBtn: {
    background: "transparent",
    color: "#007bff",
    border: "1px solid #007bff",
    padding: "10px 20px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    marginRight: 10
  },
  deleteBtn: {
    background: "#d93025",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: "14px",
    width: "100%"
  },
  courseActions: {
    marginTop: 15,
    paddingTop: 15,
    borderTop: "1px solid #eee"
  },
  activeBadge: {
    background: "#e6f7e6",
    color: "#0a730a",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: "12px",
    marginLeft: 8
  },
  inactiveBadge: {
    background: "#fdecea",
    color: "#d93025",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: "12px",
    marginLeft: 8
  },
  error: {
    background: "#fdecea",
    color: "#d93025",
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  retryBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    background: "#f8f9fa",
    borderRadius: 10,
    color: "#666"
  },
  loading: {
    textAlign: "center",
    padding: 50,
    fontSize: 18
  }
};

export default ManageCourses;