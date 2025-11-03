import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../../api/studentApi"; // ✅ updated import

const StudentRegister = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerStudent(form); // ✅ backend route now /api/students/register
      alert("✅ Student registered successfully!");
      navigate(`/student/dashboard/${res.data.uid}`);
    } catch (err) {
      console.error(err);
      alert(`❌ Registration failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>🎓 Student Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default StudentRegister;
