// src/pages/institute/AddFaculty.js
import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useParams, useNavigate, Link } from "react-router-dom";

const AddFaculty = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert("Please enter a faculty name.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "faculties"), {
        ...formData,
        institutionId: institutionId,
        createdAt: new Date()
      });

      alert("Faculty added successfully!");
      navigate(`/institutes/${institutionId}/faculties`);
    } catch (error) {
      console.error("Error adding faculty:", error);
      alert("Failed to add faculty. Please try again.");
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
            to={`/institutes/${institutionId}/faculties`}
            style={{ 
              color: "#667eea", 
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "10px"
            }}
          >
            ← Back to Faculties
          </Link>
          <h1>Add New Faculty</h1>
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
                Faculty Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Faculty of Science, Faculty of Business"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                required
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the faculty and its programs"
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  border: "1px solid #ddd", 
                  borderRadius: "4px",
                  minHeight: "100px",
                  resize: "vertical"
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
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
              {loading ? "Adding Faculty..." : "Add Faculty"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;