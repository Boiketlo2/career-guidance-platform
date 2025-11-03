// src/pages/institute/AddCourse.js
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useParams, useNavigate, Link } from "react-router-dom";

const AddCourse = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    facultyId: "",
    description: "",
    requirements: "",
    duration: ""
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facultiesLoading, setFacultiesLoading] = useState(true);

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
        setFacultiesLoading(false);
      }
    };

    fetchFaculties();
  }, [institutionId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.facultyId) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "courses"), {
        ...formData,
        institutionId: institutionId,
        createdAt: new Date()
      });

      alert("Course added successfully!");
      navigate(`/institutes/${institutionId}/courses`);
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to add course. Please try again.");
    } finally {
      setLoading(false);
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
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link 
            to={`/institutes/${institutionId}/courses`}
            style={{ 
              color: "#667eea", 
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "10px"
            }}
          >
            ← Back to Courses
          </Link>
          <h1>Add New Course</h1>
        </div>

        <div style={{ 
          background: "white", 
          padding: "30px", 
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Course Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Business Management"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Faculty *
              </label>
              {facultiesLoading ? (
                <p>Loading faculties...</p>
              ) : (
                <select
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                  required
                >
                  <option value="">Select a Faculty</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              )}
              {faculties.length === 0 && !facultiesLoading && (
                <p style={{ color: "#dc3545", marginTop: "5px" }}>
                  No faculties found. Please add faculties first.
                </p>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the course"
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  border: "1px solid #ddd", 
                  borderRadius: "4px",
                  minHeight: "80px",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Requirements
              </label>
              <input
                type="text"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="e.g., Mathematics and Science, Any subjects"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 4 years, 3 years"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || faculties.length === 0}
              style={{ 
                width: "100%",
                padding: "12px 24px", 
                backgroundColor: loading ? "#6c757d" : "#667eea", 
                color: "white", 
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600"
              }}
            >
              {loading ? "Adding Course..." : "Add Course"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;