import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
// Update this line in both files:
import "../../components/InstituteAuth.css";

const InstituteRegister = () => {
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    location: "", 
    contact: "", 
    website: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear errors when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // 1. Create authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // 2. Send email verification
      await sendEmailVerification(user);

      // 3. Create institute document in Firestore
      await setDoc(doc(db, "institutions", user.uid), {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        contact: formData.contact,
        website: formData.website,
        createdAt: new Date(),
        role: "institute",
        emailVerified: false,
        status: "active"
      });

      alert("Registration successful! Please check your email for verification.");
      navigate("/institute/login");
      
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. ";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage += "Email is already registered.";
          break;
        case "auth/invalid-email":
          errorMessage += "Invalid email address.";
          break;
        case "auth/weak-password":
          errorMessage += "Password is too weak.";
          break;
        default:
          errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Institute Registration</h2>
        <p className="auth-subtitle">Create your institution account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Institute Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter institute name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter official email"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Lesotho"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="+266 ..."
              required
            />
          </div>

          <div className="form-group">
            <label>Website (Optional)</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://your-institute.ac.ls"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register Institute"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/institute/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default InstituteRegister;