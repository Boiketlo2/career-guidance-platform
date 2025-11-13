import React, { useState } from "react";
import { companyAPI } from "../../api/companyAPI";
import { useParams, useNavigate } from "react-router-dom";

const PostJobs = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    qualifications: "",
    location: "",
    salaryRange: "",
    jobType: "full-time",
    applicationDeadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyId) {
      setError("Company ID is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyId: companyId,
        title: form.title,
        description: form.description,
        requirements: form.requirements.split(",").map(r => r.trim()).filter(r => r),
        qualifications: form.qualifications.split(",").map(q => q.trim()).filter(q => q),
        location: form.location,
        salaryRange: form.salaryRange ? { amount: form.salaryRange } : {},
        jobType: form.jobType,
        applicationDeadline: form.applicationDeadline
      };

      console.log('Posting job with payload:', payload);

      const res = await companyAPI.postJob(payload);
      console.log('Post Job Response:', res);
      
      if (res.success) {
        alert(" Job posted successfully!");
        navigate(`/company/${companyId}/jobs`);
      } else {
        setError(res.error || "Job posting failed");
      }
    } catch (err) {
      console.error("Error posting job:", err, "response:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data || err.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.headerSection}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Post a New Job</h1>
            <p style={styles.subtitle}>Fill in the details below to create a new, professional job posting</p>
            <p style={styles.companyId}>Company ID: {companyId}</p>
          </div>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <div style={styles.errorContent}>
              <h3 style={styles.errorText}>
                {error}
              </h3>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.fullWidth}>
              <label style={styles.label}>Job Title *</label>
              <input 
                name="title" 
                required 
                placeholder="e.g., Senior Software Developer" 
                value={form.title} 
                onChange={handleChange} 
                style={styles.input}
              />
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>Job Description *</label>
              <textarea 
                name="description" 
                required 
                placeholder="Describe the role, responsibilities, and what makes this position unique..." 
                value={form.description} 
                onChange={handleChange} 
                rows={4} 
                style={styles.textarea}
              />
            </div>

            <div>
              <label style={styles.label}>Requirements *</label>
              <textarea 
                name="requirements" 
                required 
                placeholder="JavaScript, React, Node.js, Team Leadership" 
                value={form.requirements} 
                onChange={handleChange} 
                rows={3} 
                style={styles.textarea}
              />
              <p style={styles.helperText}>Separate requirements with commas</p>
            </div>

            <div>
              <label style={styles.label}>Qualifications *</label>
              <textarea 
                name="qualifications" 
                required 
                placeholder="Bachelor's Degree, 3+ years experience, Professional Certification" 
                value={form.qualifications} 
                onChange={handleChange} 
                rows={3} 
                style={styles.textarea}
              />
              <p style={styles.helperText}>Separate qualifications with commas</p>
            </div>

            <div>
              <label style={styles.label}>Location *</label>
              <input 
                name="location" 
                required 
                placeholder="e.g., Maseru, Lesotho" 
                value={form.location} 
                onChange={handleChange} 
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Job Type *</label>
              <select 
                name="jobType" 
                value={form.jobType} 
                onChange={handleChange} 
                style={styles.select}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Salary Range</label>
              <input 
                name="salaryRange" 
                placeholder="e.g., M15,000 - M20,000" 
                value={form.salaryRange} 
                onChange={handleChange} 
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Application Deadline *</label>
              <input 
                name="applicationDeadline" 
                type="date" 
                required 
                value={form.applicationDeadline} 
                onChange={handleChange} 
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formActions}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              disabled={loading}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={loading ? styles.submitButtonLoading : styles.submitButton}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  Posting Job...
                </>
              ) : (
                "Post Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "32px 20px",
    fontFamily: "'Arial', sans-serif"
  },
  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
    overflow: "hidden"
  },
  headerSection: {
    padding: "32px 32px 24px 32px",
    borderBottom: "2px solid #f0f0f0",
    backgroundColor: "#fafafa"
  },
  headerContent: {
    textAlign: "center"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    fontSize: "16px",
    color: "#666666",
    margin: "0 0 8px 0",
    fontWeight: "400",
    lineHeight: "1.5"
  },
  companyId: {
    fontSize: "14px",
    color: "#888888",
    margin: "0",
    fontWeight: "500",
    fontFamily: "'Courier New', monospace"
  },
  errorAlert: {
    margin: "0 32px 24px 32px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "16px 20px"
  },
  errorContent: {
    display: "flex",
    alignItems: "center"
  },
  errorText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#dc2626",
    margin: "0"
  },
  form: {
    padding: "32px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "32px"
  },
  fullWidth: {
    gridColumn: "span 2"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333333",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#000000",
    transition: "all 0.3s ease",
    fontFamily: "inherit"
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#000000",
    resize: "vertical",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    minHeight: "80px"
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#000000",
    transition: "all 0.3s ease",
    fontFamily: "inherit"
  },
  helperText: {
    fontSize: "12px",
    color: "#666666",
    margin: "8px 0 0 0",
    fontStyle: "italic"
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    paddingTop: "24px",
    borderTop: "1px solid #f0f0f0",
    marginTop: "24px"
  },
  cancelButton: {
    padding: "12px 24px",
    border: "2px solid #cccccc",
    borderRadius: "6px",
    color: "#666666",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "100px"
  },
  submitButton: {
    padding: "12px 32px",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    backgroundColor: "#333333",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  submitButtonLoading: {
    padding: "12px 32px",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    backgroundColor: "#666666",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
    transition: "all 0.3s ease",
    minWidth: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    opacity: 0.8
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #ffffff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }
};

// Add CSS animations
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #333333 !important;
    box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
  }
  
  input:hover, textarea:hover, select:hover {
    border-color: #999999;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  .cancelButton:hover:not(:disabled) {
    background-color: #f8f9fa !important;
    border-color: #999999 !important;
    color: #333333 !important;
  }
  
  .submitButton:hover:not(:disabled) {
    background-color: #000000 !important;
  }
`;

// Only add the style once
if (!document.getElementById('post-jobs-styles')) {
  styleElement.id = 'post-jobs-styles';
  document.head.appendChild(styleElement);
}

export default PostJobs;
