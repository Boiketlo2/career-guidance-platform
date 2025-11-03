import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "../../api/companyApi"; // ✅ updated import

const CompanyRegister = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "company" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerCompany(form); // ✅ backend route now /api/companies/register
      alert("✅ Company registered successfully!");
      navigate(`/company/dashboard/${res.uid || res.data.uid}`);
    } catch (err) {
      console.error(err);
      alert(`❌ Registration failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>🏢 Company Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Company Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Company Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      </form>
      <p>Already registered? <a href="/login">Login</a></p>
    </div>
  );
};

export default CompanyRegister;
