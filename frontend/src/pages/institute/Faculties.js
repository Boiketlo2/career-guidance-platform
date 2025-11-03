// src/pages/institute/Faculties.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

const Faculties = ({ institutionId }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const facultiesSnapshot = await getDocs(collection(db, "faculties"));
        const institutionFaculties = facultiesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(faculty => faculty.institutionId === institutionId);

        setFaculties(institutionFaculties);
      } catch (error) {
        console.error("Error fetching faculties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, [institutionId]);

  const handleDeleteFaculty = async (facultyId, facultyName) => {
    if (!window.confirm(`Are you sure you want to delete "${facultyName}"? This will also delete all courses under this faculty.`)) {
      return;
    }

    setDeleting(facultyId);
    try {
      // First, check if there are any courses in this faculty
      const coursesSnapshot = await getDocs(
        query(collection(db, "courses"), where("facultyId", "==", facultyId))
      );
      
      if (coursesSnapshot.docs.length > 0) {
        if (!window.confirm(`This faculty has ${coursesSnapshot.docs.length} course(s). Deleting it will also delete all associated courses. Continue?`)) {
          setDeleting(null);
          return;
        }

        // Delete all courses in this faculty
        const deleteCoursePromises = coursesSnapshot.docs.map(courseDoc =>
          deleteDoc(doc(db, "courses", courseDoc.id))
        );
        await Promise.all(deleteCoursePromises);
      }

      // Delete the faculty
      await deleteDoc(doc(db, "faculties", facultyId));
      
      // Update local state
      setFaculties(prev => prev.filter(faculty => faculty.id !== facultyId));
      
      alert("Faculty deleted successfully!");
    } catch (error) {
      console.error("Error deleting faculty:", error);
      alert("Failed to delete faculty. Please try again.");
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

  if (loading) return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px" }}>Loading faculties...</div>
    </div>
  );

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1>Faculties Management</h1>
          <Link 
            to={`/institutes/${institutionId}/faculties/add`}
            style={{
              background: "#667eea",
              color: "white",
              padding: "10px 15px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            Add New Faculty
          </Link>
        </div>

        {faculties.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            background: "#f8f9fa", 
            borderRadius: "8px" 
          }}>
            <h3>No Faculties Found</h3>
            <p>Get started by adding your first faculty.</p>
            <Link 
              to={`/institutes/${institutionId}/faculties/add`}
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
              Add Faculty
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {faculties.map((faculty) => (
              <div key={faculty.id} style={{ 
                border: "1px solid #ddd", 
                padding: "20px", 
                borderRadius: "8px",
                backgroundColor: "white",
                position: "relative"
              }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{faculty.name}</h3>
                <p style={{ margin: "0 0 15px 0", color: "#666" }}>{faculty.description}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Link 
                    to={`/institutes/${institutionId}/courses`}
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
                    View Courses
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
                    onClick={() => handleDeleteFaculty(faculty.id, faculty.name)}
                    disabled={deleting === faculty.id}
                    style={{
                      background: deleting === faculty.id ? "#6c757d" : "#dc3545",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: deleting === faculty.id ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    {deleting === faculty.id ? "Deleting..." : "Delete"}
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

export default Faculties;