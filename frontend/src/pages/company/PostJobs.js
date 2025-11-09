import React, { useState } from "react";
import { companyAPI } from "../../api/companyAPI";
import { useAuth } from "../../context/AuthContext";

const PostJobs = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    qualifications: "",
    location: "",
    salaryRange: "",
    jobType: "full-time",
    applicationDeadline: ""
  });
  const { user } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    try {
      const payload = {
        companyId: user.uid,
        ...form,
        requirements: form.requirements.split(",").map(r => r.trim()).filter(r => r),
        qualifications: form.qualifications.split(",").map(q => q.trim()).filter(q => q)
      };

      const res = await companyAPI.postJob(payload);
      alert(`✅ Job posted successfully!`);
      setForm({
        title: "", description: "", requirements: "", qualifications: "", 
        location: "", salaryRange: "", jobType: "full-time", applicationDeadline: ""
      });
    } catch (err) {
      console.error(err);
      alert(`❌ Job posting failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "20px" }}>
      <h1>Post a Job</h1>
      
      <input
        name="title"
        placeholder="Job Title"
        value={form.title}
        onChange={handleChange}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      
      <textarea
        name="description"
        placeholder="Job Description"
        value={form.description}
        onChange={handleChange}
        style={{ width: "100%", padding: "10px", marginBottom: "10px", minHeight: "100px" }}
      />
      
      <input
        name="requirements"
        placeholder="Requirements (comma separated)"
        value={form.requirements}
        onChange={handleChange}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      
      <input
        name="qualifications"
        placeholder="Qualifications (comma separated)"
        value={form.qualifications}
        onChange={handleChange}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      
      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      
      <select name="jobType" value={form.jobType} onChange={handleChange} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
        <option value="full-time">Full Time</option>
        <option value="part-time">Part Time</option>
        <option value="contract">Contract</option>
        <option value="internship">Internship</option>
      </select>
      
      <input
        name="applicationDeadline"
        type="date"
        value={form.applicationDeadline}
        onChange={handleChange}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <button 
        onClick={handleSubmit}
        style={{ 
          width: "100%", 
          padding: "12px", 
          backgroundColor: "#667eea", 
          color: "white", 
          border: "none", 
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Post Job
      </button>
    </div>
  );
};

export default PostJobs;