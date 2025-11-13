import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authAPI } from "../../api/authAPI";

const Register = () => {
  const { role } = useParams();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: role || "student",
    // additional fields for institution/company
    institutionName: "",
    companyName: "",
    phone: "",
    location: "",
    established: "",
    faculties: "",
    website: "",
    industry: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { ...form };

      // map faculties to array if comma-separated
      if (form.role === "institution" && form.faculties) {
        payload.faculties = form.faculties.split(",").map((f) => f.trim());
      }

      const res = await authAPI.register(payload);

      // Redirect based on role -> go to the dedicated home pages
      if (form.role === "student") navigate(`/student/${res.user.uid}/home`);
      else if (form.role === "company") navigate(`/company/${res.user.uid}/home`);
      else if (form.role === "institution") navigate(`/institute/${res.user.uid}/home`);
      else if (form.role === "admin") navigate(`/admin/home/${res.user.uid}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = () => {
    const roleMap = {
      student: "Student",
      company: "Company",
      institution: "Institution",
      admin: "Administrator"
    };
    return roleMap[form.role] || "User";
  };

  const isFormValid = () => {
    const baseFields = form.name && form.email && form.password;
    if (form.role === "institution") return baseFields && form.institutionName;
    if (form.role === "company") return baseFields && form.companyName;
    return baseFields;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create {getRoleDisplayName()} Account</h2>
          <p style={styles.subtitle}>Join the career guidance platform and start your journey</p>
        </div>

        {error && (
          <div style={styles.error}>
            <div style={styles.errorIcon}>⚠️</div>
            <div style={styles.errorContent}>
              <strong style={styles.errorTitle}>Registration Error</strong>
              <div style={styles.errorMessage}>{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Common fields */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Full Name <span style={styles.required}>*</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Enter your full name"
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address <span style={styles.required}>*</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email address"
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Password <span style={styles.required}>*</span>
                </label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Create a strong password"
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="Enter phone number"
                  value={form.phone} 
                  onChange={handleChange} 
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Enter your location"
                  value={form.location} 
                  onChange={handleChange} 
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Institution-specific fields */}
          {form.role === "institution" && (
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Institution Details</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Institution Name <span style={styles.required}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="institutionName" 
                    placeholder="Enter institution name"
                    value={form.institutionName} 
                    onChange={handleChange} 
                    required 
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Year Established</label>
                  <input 
                    type="text" 
                    name="established" 
                    placeholder="e.g., 2005"
                    value={form.established} 
                    onChange={handleChange} 
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Faculties</label>
                  <input 
                    type="text" 
                    name="faculties" 
                    placeholder="e.g., Science, Arts, Engineering"
                    value={form.faculties} 
                    onChange={handleChange} 
                    style={styles.input}
                    disabled={loading}
                  />
                  <div style={styles.helperText}>Separate multiple faculties with commas</div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Website</label>
                  <input 
                    type="url" 
                    name="website" 
                    placeholder="https://example.com"
                    value={form.website} 
                    onChange={handleChange} 
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Company-specific fields */}
          {form.role === "company" && (
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Company Details</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Company Name <span style={styles.required}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="companyName" 
                    placeholder="Enter company name"
                    value={form.companyName} 
                    onChange={handleChange} 
                    required 
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Industry</label>
                  <input 
                    type="text" 
                    name="industry" 
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={form.industry} 
                    onChange={handleChange} 
                    style={styles.input}
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Website</label>
                  <input 
                    type="url" 
                    name="website" 
                    placeholder="https://example.com"
                    value={form.website} 
                    onChange={handleChange} 
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !isFormValid()}
            style={loading || !isFormValid() ? styles.buttonDisabled : styles.button}
          >
            {loading ? (
              <div style={styles.buttonContent}>
                <div style={styles.spinner}></div>
                Creating Account...
              </div>
            ) : (
              `Create ${getRoleDisplayName()} Account`
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/" style={styles.backLink}>
            ← Back to Home
          </Link>
          <div style={styles.helpLinks}>
            <span style={styles.loginText}>Already have an account?</span>
            <Link to="/login" style={styles.loginLink}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fafbfc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Inter, sans-serif'
  },
  card: {
    background: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e1e5e9',
    width: '100%',
    maxWidth: '600px',
    transition: 'all 0.2s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
    fontWeight: '400'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0,
    paddingBottom: '12px',
    borderBottom: '1px solid #f0f0f0'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px'
  },
  required: {
    color: '#dc2626'
  },
  input: {
    padding: '14px 16px',
    border: '1px solid #d0d7de',
    borderRadius: '8px',
    fontSize: '16px',
    background: '#ffffff',
    color: '#1a1a1a',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },
  helperText: {
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '4px'
  },
  button: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px'
  },
  buttonDisabled: {
    background: '#8c8c8c',
    color: '#ffffff',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginTop: '8px'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  error: {
    background: '#fef2f2',
    padding: '16px',
    borderRadius: '8px',
    color: '#dc2626',
    marginBottom: '20px',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  errorIcon: {
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '1px'
  },
  errorContent: {
    flex: 1
  },
  errorTitle: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '600'
  },
  errorMessage: {
    fontSize: '14px',
    opacity: 0.9,
    lineHeight: '1.4'
  },
  footer: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  backLink: {
    color: '#333',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  },
  helpLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  loginText: {
    fontSize: '14px',
    color: '#666'
  },
  loginLink: {
    color: '#1a1a1a',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'color 0.2s ease'
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

export default Register;
