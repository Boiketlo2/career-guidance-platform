// src/pages/institute/Courses.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

const Courses = ({ courses }) => {
  const { institutionId } = useParams();
  const [courseList, setCourseList] = useState(courses);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setCourseList(courses);
  }, [courses]);

  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      return;
    }

    setDeleting(courseId);
    try {
      // Check if there are any applications for this course
      const applicationsSnapshot = await getDocs(
        query(collection(db, "applications"), where("courseId", "==", courseName))
      );
      
      if (applicationsSnapshot.docs.length > 0) {
        if (!window.confirm(`This course has ${applicationsSnapshot.docs.length} application(s). Deleting it will remove course information from applications. Continue?`)) {
          setDeleting(null);
          return;
        }
      }

      // Delete the course
      await deleteDoc(doc(db, "courses", courseId));
      
      // Update local state
      setCourseList(prev => prev.filter(course => course.id !== courseId));
      
      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // Simple navigation component
  const SimpleNav = () => (
    <div style={{
      background: "#f8f9fa",
      padding: "15px 20px",
      borderBottom: "2px solid #667eea",
      marginBottom: "20px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ margin: 0, color: "#333" }}>Institute Portal</h3>
        <div style={{ display: "flex", gap: "15px" }}>
          <Link to={`/institutes/${institutionId}/dashboard`}>Dashboard</Link>
          <Link to={`/institutes/${institutionId}/faculties`}>Faculties</Link>
          <Link to={`/institutes/${institutionId}/courses`}>Courses</Link>
          <Link to={`/institutes/${institutionId}/applications`}>Applications</Link>
          <Link to={`/institutes/${institutionId}/profile`}>Profile</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1>Courses Management</h1>
          <Link 
            to={`/institutes/${institutionId}/courses/add`}
            style={{
              background: "#667eea",
              color: "white",
              padding: "10px 15px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            Add New Course
          </Link>
        </div>

        {courseList.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            background: "#f8f9fa", 
            borderRadius: "8px" 
          }}>
            <h3>No Courses Found</h3>
            <p>Get started by adding your first course.</p>
            <Link 
              to={`/institutes/${institutionId}/courses/add`}
              style={{
                background: "#667eea",
                color: "white",
                padding: "10px 15px",
                borderRadius: "4px",
                textDecoration: "none",
                display: "inline-block",
                marginTop: "10px"
              }}
            >
              Add Course
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
            {courseList.map((course) => (
              <div key={course.id} style={{ 
                border: "1px solid #ddd", 
                padding: "20px", 
                borderRadius: "8px",
                backgroundColor: "white"
              }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{course.name}</h3>
                <p style={{ margin: "5px 0", color: "#666" }}><strong>Faculty:</strong> {course.facultyName || "Unknown"}</p>
                <p style={{ margin: "5px 0", color: "#666" }}><strong>Duration:</strong> {course.duration || "Not specified"}</p>
                <p style={{ margin: "5px 0", color: "#666" }}><strong>Requirements:</strong> {course.requirements || "None specified"}</p>
                <div style={{ marginTop: "15px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Link 
                    to={`/institutes/${institutionId}/applications`}
                    style={{
                      background: "#28a745",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    View Applications
                  </Link>
                  <button
                    style={{
                      background: "#ffc107",
                      color: "#212529",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id, course.name)}
                    disabled={deleting === course.id}
                    style={{
                      background: deleting === course.id ? "#6c757d" : "#dc3545",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: deleting === course.id ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    {deleting === course.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;