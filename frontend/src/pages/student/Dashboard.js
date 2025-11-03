import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { switchRole } = useUser();

  const goToCompanyDashboard = () => {
    switchRole("company");
    navigate("/company/dashboard");
  };

  return (
    <div>
      <h1>Student Dashboard</h1>

      <button onClick={goToCompanyDashboard} style={{ marginBottom: "20px" }}>
        Switch to Company Dashboard
      </button>

      <ul>
        <li><Link to="/student/apply">Apply for Courses</Link></li>
        <li><Link to="/student/results">View Admission Results</Link></li>
        <li><Link to="/student/jobs">View Job Opportunities</Link></li>
        <li><Link to="/student/upload">Upload Transcripts</Link></li>
      </ul>
    </div>
  );
}
