import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    <div className="auth-page">
      <div className="glass-card" role="region" aria-label="Login form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input className="glass-input" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input className="glass-input" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button className="glass-button" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        {error && <p style={{ color: "#b91c1c", marginTop: 10 }}>{error}</p>}
        <Link to="/" className="auth-link">Go back to Home</Link>
      </div>
    </div>
  );
};

export default Login;
