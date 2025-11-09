import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const AddFaculty = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    name: "", 
    description: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setError("Faculty name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await instituteAPI.addFaculty(institutionId, form);
      
      if (response.success) {
        alert("✅ Faculty added successfully!");
        navigate(`/institute/${institutionId}/faculties`);
      } else {
        setError(response.error || "Failed to add faculty");
      }
    } catch (err) {
      console.error("Add faculty error:", err);
      
      if (err.response?.data?.error) {
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Add New Faculty</h2>
        <button 
          onClick={() => navigate(`/institute/${institutionId}/faculties`)}
          style={styles.backButton}
        >
          ← Back to Faculties
        </button>
      </div>
      
      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Faculty Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter faculty name (e.g., Faculty of Science)"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            placeholder="Brief description of the faculty (optional)"
            value={form.description}
            onChange={handleChange}
            style={styles.textarea}
            disabled={loading}
            rows={4}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            disabled={loading} 
            style={loading ? styles.buttonDisabled : styles.primaryButton}
          >
            {loading ? "Adding Faculty..." : "Add Faculty"}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate(`/institute/${institutionId}/faculties`)}
            style={styles.secondaryButton}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: 600, 
    margin: "40px auto", 
    padding: 20, 
    background: "#fff", 
    borderRadius: 10, 
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)" 
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "1px solid #eee",
    paddingBottom: 15
  },
  backButton: {
    background: "transparent",
    color: "#007bff",
    border: "1px solid #007bff",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "14px"
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: 20 
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  label: { 
    fontWeight: "600",
    color: "#333",
    fontSize: "14px"
  },
  input: { 
    padding: "12px", 
    borderRadius: 6, 
    border: "1px solid #ddd",
    fontSize: "16px",
    transition: "border-color 0.2s"
  },
  textarea: { 
    padding: "12px", 
    borderRadius: 6, 
    border: "1px solid #ddd", 
    resize: "vertical", 
    minHeight: 100,
    fontSize: "16px",
    fontFamily: "inherit",
    transition: "border-color 0.2s"
  },
  buttonGroup: {
    display: "flex",
    gap: 15,
    marginTop: 10
  },
  primaryButton: { 
    background: "#007bff", 
    color: "#fff", 
    border: "none", 
    padding: "12px 24px", 
    borderRadius: 6, 
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    flex: 1
  },
  buttonDisabled: { 
    background: "#6c757d", 
    color: "#fff", 
    border: "none", 
    padding: "12px 24px", 
    borderRadius: 6, 
    cursor: "not-allowed",
    fontSize: "16px",
    flex: 1
  },
  secondaryButton: {
    background: "transparent",
    color: "#6c757d",
    border: "1px solid #6c757d",
    padding: "12px 24px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "16px",
    flex: 1
  },
  error: { 
    background: "#fdecea", 
    color: "#d93025", 
    padding: 15, 
    borderRadius: 6, 
    marginBottom: 20,
    border: "1px solid #f5c6cb",
    fontSize: "14px"
  }
};

export default AddFaculty;