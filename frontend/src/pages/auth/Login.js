import React, { useState } from "react";
import axios from "axios"; // keep using axios for backend login
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyChdty11F_lDBCh82ADRwwv_L6-YZ7hrD8",
  authDomain: "career-guidance-platform-a368e.firebaseapp.com",
  projectId: "career-guidance-platform-a368e",
  storageBucket: "career-guidance-platform-a368e.firebasestorage.app",
  messagingSenderId: "158743703595",
  appId: "1:158743703595:web:399ceab05a120424c9fa6e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
      // 🔹 Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const idToken = await userCredential.user.getIdToken();

      // 🔹 Backend login (plural route)
      const res = await axios.post("http://localhost:5000/api/auth/login", { token: idToken });
      const user = res.data.user;

      alert(`✅ Welcome back, ${user.name}!`);

      if (user.role === "student") navigate(`/student/dashboard/${user.uid || user.id}`);
      else if (user.role === "company" || user.role === "recruiter") navigate(`/company/dashboard/${user.uid || user.id}`);
      else navigate(`/`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>🔐 Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        <p>🎓 New Student? <a href="/register/student">Register here</a></p>
        <p>🏢 New Company? <a href="/register/company">Register here</a></p>
      </div>
    </div>
  );
};

export default Login;
