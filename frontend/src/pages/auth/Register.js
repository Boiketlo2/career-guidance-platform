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

      // Redirect based on role
      if (form.role === "student") navigate(`/student/${res.user.uid}/dashboard`);
      else if (form.role === "company") navigate(`/company/${res.user.uid}/dashboard`);
      else if (form.role === "institution") navigate(`/institute/${res.user.uid}/dashboard`);
      else if (form.role === "admin") navigate(`/admin/dashboard/${res.user.uid}`);
    } catch (err) {
      console.error(err);
      alert(`❌ Registration failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h2>
        {form.role === "student" ? "🎓" : form.role === "company" ? "🏢" : form.role === "institution" ? "🏛️" : "🛡️"}{" "}
        {form.role.charAt(0).toUpperCase() + form.role.slice(1)} Registration
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Common fields */}
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />

        {/* Shared optional fields */}
        <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} />

        {/* Institution-specific fields */}
        {form.role === "institution" && (
          <>
            <input type="text" name="institutionName" placeholder="Institution Name" value={form.institutionName} onChange={handleChange} required />
            <input type="text" name="established" placeholder="Year Established (e.g., 2005)" value={form.established} onChange={handleChange} />
            <input type="text" name="faculties" placeholder="Faculties (comma-separated)" value={form.faculties} onChange={handleChange} />
            <input type="url" name="website" placeholder="Website URL" value={form.website} onChange={handleChange} />
          </>
        )}

        {/* Company-specific fields */}
        {form.role === "company" && (
          <>
            <input type="text" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} required />
            <input type="text" name="industry" placeholder="Industry (e.g., Tech, Health)" value={form.industry} onChange={handleChange} />
            <input type="url" name="website" placeholder="Website URL" value={form.website} onChange={handleChange} />
          </>
        )}

        {/* No extra fields needed for admin */}

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <Link to="/" style={{ display: "inline-block", marginTop: "20px", color: "#667eea", textDecoration: "underline" }}>
        ← Go back to Home
      </Link>
    </div>
  );
};

export default Register;
