import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { switchRole } = useUser();

  const goToStudentDashboard = () => {
    switchRole("student");
    navigate("/student/dashboard");
  };

  return (
    <div>
      <h1>Company Dashboard</h1>

      <button onClick={goToStudentDashboard} style={{ marginBottom: "20px" }}>
        Switch to Student Dashboard
      </button>

      <ul>
        <li><Link to="/company/post-job">Post a Job</Link></li>
        <li><Link to="/company/applicants/companyName">View Applicants</Link></li>
        <li><Link to="/company/feedback">Send Feedback</Link></li>
      </ul>
    </div>
  );
}
