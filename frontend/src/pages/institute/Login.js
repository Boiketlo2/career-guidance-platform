// src/pages/institute/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import "../../components/InstituteAuth.css";

const InstituteLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login for:", formData.email);
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      console.log("Login successful, user ID:", user.uid);

      // ✅ FIX: Find institution by email instead of user ID
      const institutionsSnapshot = await getDocs(
        query(collection(db, "institutions"), where("email", "==", user.email))
      );
      
      if (institutionsSnapshot.empty) {
        console.log("No institute found for email:", user.email);
        await auth.signOut();
        setError("No institute account found with this email!");
        return;
      }

      // Get the first matching institution
      const instituteDoc = institutionsSnapshot.docs[0];
      const instituteData = instituteDoc.data();
      console.log("Institute document found:", instituteData.name);

      // ✅ TEMPORARILY COMMENTED OUT FOR DEVELOPMENT
      // Email verification check - uncomment this before production
      /*
      if (!user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox.");
        await auth.signOut();
        return;
      }
      */

      // Successful login - redirect to dashboard
      // ✅ FIX: Use the institution document ID, not the auth user ID
      console.log("Redirecting to dashboard for institution:", instituteDoc.id);
      navigate(`/institutes/${instituteDoc.id}/dashboard`);
      
    } catch (error) {
      console.error("Login error details:", {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      let errorMessage = "Login failed. ";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage += "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage += "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage += "Invalid email address.";
          break;
        case "auth/invalid-credential":
          errorMessage += "Invalid email or password.";
          break;
        case "auth/too-many-requests":
          errorMessage += "Too many failed attempts. Try again later.";
          break;
        case "auth/user-disabled":
          errorMessage += "This account has been disabled.";
          break;
        default:
          errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      setError("");
    } catch (error) {
      setError(`Password reset failed: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Institute Login</h2>
        <p className="auth-subtitle">Access your institution dashboard</p>
        
        {error && <div className="error-message">{error}</div>}
        
        {resetEmailSent && (
          <div style={{ 
            background: "#e8f5e8", 
            color: "#2d5a2d", 
            padding: "12px", 
            borderRadius: "6px", 
            marginBottom: "20px",
            textAlign: "center"
          }}>
            Password reset email sent! Check your inbox.
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Login to Dashboard"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button 
            onClick={handleForgotPassword}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Forgot your password?
          </button>
        </div>

        <p className="auth-link">
          Don't have an account? <Link to="/institute/register">Register here</Link>
        </p>

        {/* Development Note */}
        <div style={{ 
          marginTop: "20px", 
          padding: "10px", 
          background: "#fff3cd", 
          border: "1px solid #ffeaa7",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#856404"
        }}>
          <strong>Development Mode:</strong> Email verification is temporarily disabled for testing.
        </div>

        {/* Test Credentials Info */}
        <div style={{ 
          marginTop: "15px", 
          padding: "10px", 
          background: "#d1ecf1", 
          border: "1px solid #bee5eb",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#0c5460"
        }}>
          <strong>Test Credentials:</strong>
          <br />
          • Limkokwing: info@limkokwing.ac.ls / password123
          <br />
          • NUL: admissions@nul.ls / password123
          <br />
          • Botho: bothouniversitybu@career.ls / password123
        </div>
      </div>
    </div>
  );
};

// ✅ FIX: Export the correct component name
export default InstituteLogin;