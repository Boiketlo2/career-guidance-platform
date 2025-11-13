import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const { login: contextLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use AuthContext.login so context state is updated immediately
      const res = await contextLogin(form.email, form.password);

      const user = res?.user;
      const uid = user?.uid || user?._id || user?.id;

      if (res.success && user) {
        if (user.role === "student") navigate(`/student/${uid}/home`);
        else if (user.role === "company") navigate(`/company/${uid}/home`);
        else if (user.role === "institution") navigate(`/institute/${uid}/home`);
        else if (user.role === "admin") navigate(`/admin/home/${uid}`);
        else navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        {error && (
          <div style={styles.error}>
            <div style={styles.errorIcon}>⚠️</div>
            <div style={styles.errorContent}>
              <strong style={styles.errorTitle}>Login Error</strong>
              <div style={styles.errorMessage}>{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
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
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter your password"
              value={form.password} 
              onChange={handleChange} 
              required 
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !form.email || !form.password}
            style={loading || !form.email || !form.password ? styles.buttonDisabled : styles.button}
          >
            {loading ? (
              <div style={styles.buttonContent}>
                <div style={styles.spinner}></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/" style={styles.backLink}>
            ← Back to Home
          </Link>
          <div style={styles.helpLinks}>
            <Link to="/forgot-password" style={styles.helpLink}>
              Forgot Password?
            </Link>
            <span style={styles.separator}>•</span>
            <Link to="/register" style={styles.helpLink}>
              Create Account
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
    maxWidth: '420px',
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
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center'
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
  helpLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease'
  },
  separator: {
    color: '#8c8c8c',
    fontSize: '12px'
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

export default Login;
