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
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
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
      setSuccess("");
      
      const response = await instituteAPI.addFaculty(institutionId, form);
      
      if (response.success) {
        setSuccess("Faculty added successfully!");
        setTimeout(() => {
          navigate(`/institute/${institutionId}/faculties`);
        }, 1500);
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

  const handleInputFocus = (e) => {
    e.target.style.borderColor = styles.inputFocus.borderColor;
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = styles.input.borderColor;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>Add New Faculty</h2>
          <p style={styles.subtitle}>Create a new faculty for your institution</p>
        </div>
        <button 
          onClick={() => navigate(`/institute/${institutionId}/faculties`)}
          style={styles.backButton}
          disabled={loading}
        >
          ← Back to Faculties
        </button>
      </div>
      
      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}></div>
          <div>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div style={styles.success}>
          <div style={styles.successIcon}>✓</div>
          <div>
            <strong style={styles.successTitle}>Success</strong>
            <div style={styles.successMessage}>{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Faculty Name <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter faculty name (e.g., Faculty of Science)"
            value={form.name}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            required
            style={styles.input}
            disabled={loading}
            autoFocus
          />
          <div style={styles.helperText}>
            Required field. Enter the official name of the faculty.
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            placeholder="Brief description of the faculty, including departments, focus areas, and key information..."
            value={form.description}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={styles.textarea}
            disabled={loading}
            rows={5}
          />
          <div style={styles.helperText}>
            Optional. Provide a detailed description to help students understand the faculty's offerings.
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            disabled={loading || !form.name.trim()} 
            style={ 
              loading || !form.name.trim() 
                ? styles.buttonDisabled 
                : styles.primaryButton
            }
          >
            {loading ? (
              <div style={styles.buttonContent}>
                <div style={styles.spinner}></div>
                Adding Faculty...
              </div>
            ) : (
              "Add Faculty"
            )}
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
    maxWidth: 700, 
    margin: "40px auto", 
    padding: 0,
    background: "#ffffff",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e1e5e9"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "30px 30px 20px 30px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafbfc"
  },
  headerContent: {
    flex: 1
  },
  title: { 
    fontSize: "24px", 
    fontWeight: "600", 
    color: "#1a1a1a",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
    fontWeight: "400"
  },
  backButton: {
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "10px 20px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    marginLeft: 20
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: 24,
    padding: "30px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  label: { 
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: "14px",
    marginBottom: 4
  },
  required: {
    color: "#d93025"
  },
  input: { 
    padding: "12px 16px", 
    borderRadius: 6, 
    border: "1px solid #d0d7de",
    fontSize: "15px",
    transition: "all 0.2s ease",
    background: "#ffffff",
    color: "#1a1a1a"
  },
  inputFocus: {
    borderColor: "#1a1a1a",
    boxShadow: "0 0 0 3px rgba(26, 26, 26, 0.1)"
  },
  textarea: { 
    padding: "12px 16px", 
    borderRadius: 6, 
    border: "1px solid #d0d7de", 
    resize: "vertical", 
    minHeight: 120,
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    background: "#ffffff",
    color: "#1a1a1a",
    lineHeight: "1.5"
  },
  helperText: {
    fontSize: "13px",
    color: "#666",
    marginTop: 4,
    fontStyle: "italic"
  },
  buttonGroup: {
    display: "flex",
    gap: 12,
    marginTop: 16,
    paddingTop: 20,
    borderTop: "1px solid #f0f0f0"
  },
  primaryButton: { 
    background: "#1a1a1a", 
    color: "#ffffff", 
    border: "none", 
    padding: "14px 28px", 
    borderRadius: 6, 
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    flex: 1,
    transition: "all 0.2s ease",
    height: "48px"
  },
  buttonDisabled: { 
    background: "#8c8c8c", 
    color: "#ffffff", 
    border: "none", 
    padding: "14px 28px", 
    borderRadius: 6, 
    cursor: "not-allowed",
    fontSize: "15px",
    flex: 1,
    height: "48px"
  },
  secondaryButton: {
    background: "transparent",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "14px 28px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    flex: 1,
    transition: "all 0.2s ease",
    height: "48px"
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid transparent",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  error: { 
    background: "#fef2f2", 
    color: "#dc2626", 
    padding: "20px", 
    borderRadius: 6, 
    margin: "0 30px 20px 30px",
    border: "1px solid #fecaca",
    fontSize: "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: 12
  },
  errorIcon: {
    fontSize: "16px",
    flexShrink: 0,
    marginTop: 1
  },
  errorTitle: {
    display: "block",
    marginBottom: 4
  },
  errorMessage: {
    opacity: 0.9
  },
  success: { 
    background: "#f0f9ff", 
    color: "#0369a1", 
    padding: "20px", 
    borderRadius: 6, 
    margin: "0 30px 20px 30px",
    border: "1px solid #bae6fd",
    fontSize: "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: 12
  },
  successIcon: {
    fontSize: "16px",
    flexShrink: 0,
    marginTop: 1,
    fontWeight: "bold"
  },
  successTitle: {
    display: "block",
    marginBottom: 4
  },
  successMessage: {
    opacity: 0.9
  }
};

// Add CSS for spinner animation
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default AddFaculty;
