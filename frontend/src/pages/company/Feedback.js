import React, { useState } from "react";
import { sendFeedback } from "../../api/companyApi";

export default function Feedback() {
  const [form, setForm] = useState({ applicationId: "", feedback: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    sendFeedback(form)
      .then(() => alert("Feedback Sent"))
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      <h1>Send Feedback</h1>
      <input name="applicationId" placeholder="Application ID" value={form.applicationId} onChange={handleChange} />
      <textarea name="feedback" placeholder="Feedback" value={form.feedback} onChange={handleChange} />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}
