import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const PublishAdmissions = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate deadline is in the future
    if (form.deadline && new Date(form.deadline) <= new Date()) {
      setError("Deadline must be a future date");
      setLoading(false);
      return;
    }

    try {
      const response = await instituteAPI.publishAdmissions(institutionId, form);
      if (response.success) {
        setSuccess("Admissions published successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/institute/${institutionId}/admissions`);
        }, 2000);
      } else {
        setError(response.error || "Failed to publish admissions");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/institute/${institutionId}/admissions`);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>Publish New Admissions</h2>
          <p style={styles.subtitle}>Create a new admission cycle for student applications</p>
        </div>
        <button 
          onClick={handleCancel}
          style={styles.backButton}
          disabled={loading}
        >
          ← Back to Admissions
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}></div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div style={styles.success}>
          <div style={styles.successIcon}>✓</div>
          <div style={styles.successContent}>
            <strong style={styles.successTitle}>Success</strong>
            <div style={styles.successMessage}>{success}</div>
          </div>
        </div>
      )}

      <div style={styles.formContainer}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Admission Title <span style={styles.required}>*</span>
            </label>
            <input 
              type="text" 
              name="title" 
              value={form.title} 
              onChange={handleChange}
              placeholder="e.g., Fall 2024 Admissions, Spring 2025 Intake"
              required 
              style={styles.input}
              disabled={loading}
              autoFocus
            />
            <div style={styles.helperText}>
              Give a clear title that students will recognize
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description
            </label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange}
              placeholder="Provide details about this admission cycle, requirements, important notes..."
              style={styles.textarea}
              disabled={loading}
              rows={5}
            />
            <div style={styles.helperText}>
              Optional. Include important information for applicants
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Application Deadline
            </label>
            <input 
              type="date" 
              name="deadline" 
              value={form.deadline} 
              onChange={handleChange}
              min={getMinDate()}
              style={styles.input}
              disabled={loading}
            />
            <div style={styles.helperText}>
              Optional. Set a deadline for applications (must be a future date)
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              disabled={loading || !form.title.trim()} 
              style={ 
                loading || !form.title.trim() 
                  ? styles.primaryButtonDisabled 
                  : styles.primaryButton
              }
            >
              {loading ? (
                <div style={styles.buttonContent}>
                  <div style={styles.spinner}></div>
                  Publishing Admissions...
                </div>
              ) : (
                " Publish Admissions"
              )}
            </button>
            
            <button 
              type="button"
              onClick={handleCancel}
              style={styles.secondaryButton}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={styles.sidePanel}>
          <h4 style={styles.sidePanelTitle}>Admission Guidelines</h4>
          <div style={styles.guidelines}>
            <div style={styles.guidelineItem}>
              <div style={styles.guidelineIcon}></div>
              <div style={styles.guidelineContent}>
                <strong>Clear Titles</strong>
                <p>Use descriptive titles that indicate the intake period and year</p>
              </div>
            </div>
            <div style={styles.guidelineItem}>
              <div style={styles.guidelineIcon}></div>
              <div style={styles.guidelineContent}>
                <strong>Detailed Descriptions</strong>
                <p>Include important requirements, dates, and special instructions</p>
              </div>
            </div>
            <div style={styles.guidelineItem}>
              <div style={styles.guidelineIcon}></div>
              <div style={styles.guidelineContent}>
                <strong>Realistic Deadlines</strong>
                <p>Set deadlines that give students enough time to apply</p>
              </div>
            </div>
            <div style={styles.guidelineItem}>
              <div style={styles.guidelineIcon}></div>
              <div style={styles.guidelineContent}>
                <strong>Student Notifications</strong>
                <p>Students will be notified when admissions are published</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: 1000, 
    margin: "40px auto", 
    padding: "0 20px",
    fontFamily: "Inter, sans-serif" 
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: "1px solid #e1e5e9"
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "16px",
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
  formContainer: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 40,
    alignItems: "flex-start"
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: 24,
    background: "#ffffff",
    padding: 32,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9"
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
    color: "#dc2626"
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
  textarea: { 
    padding: "12px 16px", 
    borderRadius: 6, 
    border: "1px solid #d0d7de", 
    resize: "vertical", 
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    background: "#ffffff",
    color: "#1a1a1a",
    lineHeight: "1.5",
    minHeight: 120
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
    paddingTop: 24,
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
    flex: 2,
    transition: "all 0.2s ease"
  },
  primaryButtonDisabled: { 
    background: "#8c8c8c", 
    color: "#ffffff", 
    border: "none", 
    padding: "14px 28px", 
    borderRadius: 6, 
    cursor: "not-allowed",
    fontSize: "15px",
    flex: 2
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
    transition: "all 0.2s ease"
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
    borderRadius: 8, 
    marginBottom: 24,
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
    borderRadius: 8, 
    marginBottom: 24,
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
  },
  sidePanel: {
    background: "#fafbfc",
    padding: "24px",
    borderRadius: 8,
    border: "1px solid #e1e5e9",
    height: "fit-content"
  },
  sidePanelTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 20px 0"
  },
  guidelines: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  guidelineItem: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start"
  },
  guidelineIcon: {
    fontSize: "18px",
    flexShrink: 0,
    marginTop: 2
  },
  guidelineContent: {
    flex: 1
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

export default PublishAdmissions;
