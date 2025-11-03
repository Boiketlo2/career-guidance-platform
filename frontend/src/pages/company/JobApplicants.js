import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function JobApplicants() {
  const { companyId } = useParams();
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    if (!companyId) return;

    axios
      .get(`http://localhost:5000/api/companies/${companyId}/applicants`)
      .then((res) => setApplicants(res.data))
      .catch((err) => console.error("❌ Failed to fetch applicants:", err));
  }, [companyId]);

  return (
    <div>
      <h1>Applicants for Company: {companyId}</h1>
      <ul>
        {applicants.map((app) => (
          <li key={`${app.jobId}-${app.studentId}`}>
            <strong>Student:</strong> {app.studentId} |{" "}
            <strong>Job:</strong> {app.jobId} |{" "}
            <strong>Status:</strong> {app.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
