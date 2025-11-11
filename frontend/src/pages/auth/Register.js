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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...form };

      // map faculties to array if comma-separated
      if (form.role === "institution" && form.faculties) {
        payload.faculties = form.faculties.split(",").map((f) => f.trim());
      }

      const res = await authAPI.register(payload);

      alert(`✅ ${form.role.charAt(0).toUpperCase() + form.role.slice(1)} registered successfully!`);

  // Redirect based on role -> go to the dedicated home pages
  if (form.role === "student") navigate(`/student/${res.user.uid}/home`);
  else if (form.role === "company") navigate(`/company/${res.user.uid}/home`);
  else if (form.role === "institution") navigate(`/institute/${res.user.uid}/home`);
  else if (form.role === "admin") navigate(`/admin/home/${res.user.uid}`);
    } catch (err) {
      console.error(err);
      alert(`❌ Registration failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card" role="region" aria-label="Registration form">
        <h2>{form.role.charAt(0).toUpperCase() + form.role.slice(1)} Registration</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Common fields */}
          <input className="glass-input" type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input className="glass-input" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input className="glass-input" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />

          {/* Shared optional fields */}
          <input className="glass-input" type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input className="glass-input" type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} />

          {/* Institution-specific fields */}
          {form.role === "institution" && (
            <>
              <input className="glass-input" type="text" name="institutionName" placeholder="Institution Name" value={form.institutionName} onChange={handleChange} required />
              <input className="glass-input" type="text" name="established" placeholder="Year Established (e.g., 2005)" value={form.established} onChange={handleChange} />
              <input className="glass-input" type="text" name="faculties" placeholder="Faculties (comma-separated)" value={form.faculties} onChange={handleChange} />
              <input className="glass-input" type="url" name="website" placeholder="Website URL" value={form.website} onChange={handleChange} />
            </>
          )}

          {/* Company-specific fields */}
          {form.role === "company" && (
            <>
              <input className="glass-input" type="text" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} required />
              <input className="glass-input" type="text" name="industry" placeholder="Industry (e.g., Tech, Health)" value={form.industry} onChange={handleChange} />
              <input className="glass-input" type="url" name="website" placeholder="Website URL" value={form.website} onChange={handleChange} />
            </>
          )}

          <button className="glass-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <Link to="/" className="auth-link">Go back to Home</Link>
      </div>
    </div>
  );
};

export default Register;
