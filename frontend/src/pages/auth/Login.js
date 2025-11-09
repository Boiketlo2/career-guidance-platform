import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/authAPI";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.login(form);
      const user = res.user;

      alert(`✅ Welcome back, ${user.name || user.institutionName || user.companyName}!`);

      // Redirect based on role
      if (user.role === "student") navigate(`/student/dashboard/${user.uid}`);
      else if (user.role === "company") navigate(`/company/dashboard/${user.uid}`);
      else if (user.role === "institution") navigate(`/institute/dashboard/${user.uid}`);
      else if (user.role === "admin") navigate(`/admin/dashboard/${user.uid}`);
      else navigate(`/`);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>🔐 Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link to="/" style={{ display: "inline-block", marginTop: "20px", color: "#667eea", textDecoration: "underline" }}>
        ← Go back to Home
      </Link>
    </div>
  );
};

export default Login;
