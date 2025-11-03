import React, { useState } from "react";
import { postJob } from "../../api/companyApi";

export default function PostJob() {
  const [form, setForm] = useState({
    companyId: "", // must match backend field
    title: "",
    description: "",
    requirements: "",
    deadline: ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const reqArray = form.requirements.split(",").map(r => r.trim());
      const payload = { ...form, requirements: reqArray };
      const res = await postJob(payload);
      alert(`✅ Job posted successfully (Job ID: ${res.jobId})`);
    } catch (err) {
      console.error(err);
      alert(`❌ Job posting failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h1>Post a Job</h1>
      <input
        name="companyId"
        placeholder="Company ID"
        value={form.companyId}
        onChange={handleChange}
      />
      <input
        name="title"
        placeholder="Job Title"
        value={form.title}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input
        name="requirements"
        placeholder="Requirements (comma separated)"
        value={form.requirements}
        onChange={handleChange}
      />
      <input
        name="deadline"
        type="date"
        value={form.deadline}
        onChange={handleChange}
      />
      <button onClick={handleSubmit}>Post Job</button>
    </div>
  );
}
