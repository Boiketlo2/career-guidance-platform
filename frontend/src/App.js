import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { UserProvider } from "./contexts/UserContext";

// Auth
import Login from "./pages/auth/Login";
import StudentRegister from "./pages/auth/StudentRegister";
import CompanyRegister from "./pages/auth/CompanyRegister";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import ApplyCourse from "./pages/student/ApplyCourse";
import AdmissionResults from "./pages/student/AdmissionResults";
import Jobs from "./pages/student/Jobs";
import UploadTranscripts from "./pages/student/UploadTranscripts";

// Company Pages
import CompanyDashboard from "./pages/company/Dashboard";
import PostJob from "./pages/company/PostJob";
import JobApplicants from "./pages/company/JobApplicants";
import Feedback from "./pages/company/Feedback";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/company" element={<CompanyRegister />} />

          {/* Student */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/apply" element={<ApplyCourse />} />
          <Route path="/student/results" element={<AdmissionResults />} />
          <Route path="/student/jobs" element={<Jobs />} />
          <Route path="/student/upload" element={<UploadTranscripts />} />

          {/* Company */}
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/post-job" element={<PostJob />} />
          <Route path="/company/applicants/:companyName" element={<JobApplicants />} />
          <Route path="/company/feedback" element={<Feedback />} />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/student/dashboard" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
