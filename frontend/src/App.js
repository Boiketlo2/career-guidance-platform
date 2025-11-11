// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";

// Auth Components
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import EmailVerification from "./pages/auth/EmailVerification";

// Public Pages
import Home from "./pages/public/Home";
import Institutions from "./pages/public/Institutions";
import Courses from "./pages/public/Courses";

// Institute Pages
import InstituteHome from "./pages/institute/InstituteHome";
import ManageCourses from "./pages/institute/ManageCourses";
import ManageFaculties from "./pages/institute/ManageFaculties";
import ViewApplications from "./pages/institute/ViewApplications";
import InstituteProfile from "./pages/institute/Profile";
import AddCourse from "./pages/institute/AddCourse";
import AddFaculty from "./pages/institute/AddFaculty";
import PublishAdmissions from "./pages/institute/PublishAdmissions";
import Admissions from "./pages/institute/Admissions"; // NEW IMPORT

// Student Pages
import StudentHome from "./pages/student/StudentHome";
import ApplyCourses from "./pages/student/ApplyCourses";
import JobPortal from "./pages/student/JobPortal";
import StudentProfile from "./pages/student/Profile";
import UploadDocuments from "./pages/student/UploadDocuments";
import ViewAdmissions from "./pages/student/ViewAdmissions";

// Company Pages
import CompanyHome from "./pages/company/CompanyHome";
import PostJobs from "./pages/company/PostJobs";
import ManageJobs from "./pages/company/ManageJobs";
import ViewApplicants from "./pages/company/ViewApplicants";
import CompanyProfile from "./pages/company/CompanyProfile";

// Admin Pages
import AdminHome from "./pages/admin/AdminHome";
import ManageInstitutes from "./pages/admin/ManageInstitutes";
import ManageFacultiesCourses from "./pages/admin/ManageFacultiesCourses";
import AdminPublishAdmissions from "./pages/admin/PublishAdmissions";
import ManageCompanies from "./pages/admin/ManageCompanies";
import SystemReports from "./pages/admin/SystemReports";

// Common Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";

// -------------------------
// Protected Route Component
// -------------------------
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.uid) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" />;
  return children;
};

// -------------------------
// Role-based redirect
// -------------------------
const RoleBasedRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  useEffect(() => {
    if (user.uid && user.role) {
      switch (user.role) {
        case "admin":
          window.location.href = `/admin/home/${user.uid}`;
          break;
        case "institution":
          window.location.href = `/institute/${user.uid}/home`;
          break;
        case "student":
          window.location.href = `/student/${user.uid}/home`;
          break;
        case "company":
          window.location.href = `/company/${user.uid}/home`;
          break;
        default:
          window.location.href = "/";
      }
    }
  }, [user]);
  return <LoadingSpinner />;
};

// -------------------------
// 404 Page
// -------------------------
const NotFound = () => (
  <div style={{ textAlign: "center", padding: "50px" }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go back to homepage</a>
  </div>
);

// -------------------------
// Unauthorized Page
// -------------------------
const Unauthorized = () => (
  <div style={{ textAlign: "center", padding: "50px" }}>
    <h1>401 - Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
    <a href="/">Go back to homepage</a>
  </div>
);

// -------------------------
// Main App Component
// -------------------------
function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <div className="App">
            <Header />
            <main style={{ minHeight: "80vh" }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/institutions" element={<Institutions />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register/:role?" element={<Register />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Auth Redirect */}
                <Route path="/dashboard" element={<RoleBasedRedirect />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/home/:adminId"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/institutions"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageInstitutes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/faculties"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageFacultiesCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/publish"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPublishAdmissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/companies"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageCompanies />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <SystemReports />
                    </ProtectedRoute>
                  }
                />

                {/* Institute Routes */}
                <Route
                  path="/institute/:institutionId/home"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <InstituteHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/:institutionId/faculties"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <ManageFaculties />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/:institutionId/courses"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <ManageCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/:institutionId/courses/add"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <AddCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/:institutionId/faculties/add"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <AddFaculty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/:institutionId/admissions/publish"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <PublishAdmissions />
                    </ProtectedRoute>
                  }
                />
                {/* NEW ADMISSIONS ROUTE */}
                <Route
                  path="/institute/:institutionId/admissions"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <Admissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/:institutionId/applications"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <ViewApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/:institutionId/profile"
                  element={
                    <ProtectedRoute requiredRole="institution">
                      <InstituteProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/student/:studentId/home"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/:studentId/apply"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ApplyCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/:studentId/jobs"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <JobPortal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/:studentId/profile"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/:studentId/upload"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <UploadDocuments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/:studentId/results"
                  element={
                    <ProtectedRoute requiredRole="student">
                      <ViewAdmissions />
                    </ProtectedRoute>
                  }
                />

                {/* Company Routes */}
                <Route
                  path="/company/:companyId/home"
                  element={
                    <ProtectedRoute requiredRole="company">
                      <CompanyHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/:companyId/post-job"
                  element={
                    <ProtectedRoute requiredRole="company">
                      <PostJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/:companyId/jobs"
                  element={
                    <ProtectedRoute requiredRole="company">
                      <ManageJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/:companyId/applicants"
                  element={
                    <ProtectedRoute requiredRole="company">
                      <ViewApplicants />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/:companyId/profile"
                  element={
                    <ProtectedRoute requiredRole="company">
                      <CompanyProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;