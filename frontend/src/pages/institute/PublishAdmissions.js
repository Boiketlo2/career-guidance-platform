import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const PublishAdmissions = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await instituteAPI.publishAdmissions(institutionId, form);
      if (response.success) {
        alert("Admissions published successfully!");
        navigate(`/institute/${institutionId}`);
      } else {
        setError(response.error || "Failed to publish admissions");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Publish Admissions</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <label>
          Title:
          <input type="text" name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Description:
          <textarea name="description" value={form.description} onChange={handleChange} />
        </label>
        <label>
          Deadline:
          <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
        </label>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? "Publishing..." : "Publish Admissions"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "Inter, sans-serif" },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  btn: { padding: "10px 15px", borderRadius: 6, border: "none", background: "#007bff", color: "#fff", cursor: "pointer" },
  error: { color: "#d93025" },
};

export default PublishAdmissions;