import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentAPI } from "../../api/studentAPI";
import { authAPI } from "../../api/authAPI";

const StudentHome = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    jobsApplied: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const [profileRes, applicationsRes, admissionsRes, jobsRes] = await Promise.all([
        studentAPI.getProfile(studentId),
        studentAPI.getStudentApplications(studentId),
        studentAPI.getAdmissionResults(studentId),
        studentAPI.getAllJobs(),
      ]);

      if (profileRes?.success) setStudent(profileRes.student);

      if (applicationsRes?.success) {
        const apps = applicationsRes.applications || [];
        setRecentApplications(apps.slice(0, 3));
      }

      const apps = applicationsRes?.applications || [];
      const admissions = admissionsRes?.results || [];
      const jobs = jobsRes?.jobs || [];

      const jobsApplied = jobs.filter((job) => job.applicants?.includes(studentId)).length;

      setStats({
        applications: apps.length,
        pending: admissions.filter((a) => a.status === "pending").length,
        approved: admissions.filter((a) => a.status === "approved").length,
        rejected: admissions.filter((a) => a.status === "rejected").length,
        jobsApplied,
      });
    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const res = await authAPI.verifyEmail(studentId);
      alert(res.success ? "Verification email sent." : "Failed to send email.");
    } catch {
      alert("Error sending verification email.");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: "#fff7ed", text: "#92400e" },
      approved: { bg: "#ecfdf5", text: "#065f46" },
      rejected: { bg: "#fef2f2", text: "#991b1b" },
    };
    const color = colors[status] || colors.pending;

    return (
      <span
        style={{
          background: color.bg,
          color: color.text,
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Student Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Dashboard</h1>
          <p style={styles.welcomeText}>Welcome back, {student?.name || "Student"}!</p>
        </div>
        {/* Logout button removed since it's in the header component */}
      </header>

      {/* Email Verification Alert */}
      {student && !student.emailVerified && (
        <div style={styles.verificationAlert}>
          <div style={styles.alertContent}>
            <div>
              <strong>Verify your email address</strong>
              <p>Please verify your email to access all features</p>
            </div>
          </div>
          <button style={styles.verifyBtn} onClick={handleResendVerification}>
            Resend Verification
          </button>
        </div>
      )}

      {/* Quick Navigation */}
      <nav style={styles.quickNav}>
        <QuickLink label="Apply for Courses" description="Browse and apply to courses" to={`/student/${studentId}/apply`} navigate={navigate} />
        <QuickLink label="Admission Results" description="See your admission decisions" to={`/student/${studentId}/results`} navigate={navigate} />
        <QuickLink label="Browse Jobs" description="Find career opportunities" to={`/student/${studentId}/jobs`} navigate={navigate} />
        <QuickLink label="Upload Documents" description="Manage your transcripts & certificates" to={`/student/${studentId}/upload`} navigate={navigate} />
        <QuickLink label="Update Profile" description="Edit your personal information" to={`/student/${studentId}/profile`} navigate={navigate} />
      </nav>

      {/* Stats */}
      <div style={styles.statsSection}>
        <h2 style={styles.sectionTitle}>Overview</h2>
        <div style={styles.statsGrid}>
          <StatCard title="Course Applications" value={stats.applications} color="#3b82f6" onClick={() => navigate(`/student/${studentId}/applications`)} />
          <StatCard title="Pending Decisions" value={stats.pending} color="#f59e0b" onClick={() => navigate(`/student/${studentId}/results`)} />
          <StatCard title="Approved" value={stats.approved} color="#10b981" onClick={() => navigate(`/student/${studentId}/results`)} />
          <StatCard title="Jobs Applied" value={stats.jobsApplied} color="#8b5cf6" onClick={() => navigate(`/student/${studentId}/jobs`)} />
        </div>
      </div>

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <div style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Applications</h2>
            <button style={styles.viewAllButton} onClick={() => navigate(`/student/${studentId}/applications`)}>
              View All
            </button>
          </div>
          <div style={styles.recentList}>
            {recentApplications.map((app, index) => (
              <div key={app.id || index} style={styles.recentCard}>
                <div>
                  <h4 style={styles.courseName}>{app.courseName}</h4>
                  <p style={styles.institutionName}>{app.institutionName}</p>
                  <p style={styles.applicationDate}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                {getStatusBadge(app.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={styles.tipsSection}>
        <h3 style={styles.tipsTitle}>Quick Tips</h3>
        <div style={styles.tipsGrid}>
          <div style={styles.tipCard}>
            <h4>Complete Your Profile</h4>
            <p>Ensure your profile is up-to-date for better job matches</p>
          </div>
          <div style={styles.tipCard}>
            <h4>Upload Documents</h4>
            <p>Add your transcripts and certificates for applications</p>
          </div>
          <div style={styles.tipCard}>
            <h4>Track Applications</h4>
            <p>Regularly check your application status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Components */
const QuickLink = ({ label, description, to, navigate }) => (
  <button style={styles.quickLink} onClick={() => navigate(to)}>
    <div>
      <h4 style={{ margin: "0 0 6px 0", color: "#111827" }}>{label}</h4>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>{description}</p>
    </div>
    <span style={{ color: "#9ca3af", fontSize: "18px" }}>→</span>
  </button>
);

const StatCard = ({ title, value, color, onClick }) => (
  <div style={styles.statCard} onClick={onClick}>
    <div style={{ ...styles.statIcon, backgroundColor: color + "1A", color }}>{value}</div>
    <div>
      <h4 style={{ margin: 0, color: "#111827" }}>{title}</h4>
    </div>
  </div>
);

/* Styles */
const styles = {
  container: { background: "#f3f4f6", minHeight: "100vh", padding: "30px 20px", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" },
  title: { fontSize: "2rem", fontWeight: "700", color: "#111827", borderBottom: "3px solid #3b82f6", display: "inline-block", paddingBottom: "6px" },
  welcomeText: { fontSize: "1.1rem", color: "#6b7280" },
  verificationAlert: { background: "#fff8e1", borderLeft: "5px solid #fbbf24", padding: "15px 20px", borderRadius: "8px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  verifyBtn: { background: "#fbbf24", color: "#111827", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" },
  quickNav: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" },
  quickLink: { background: "#fff", border: "1px solid #e5e7eb", padding: "20px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer" },
  statsSection: { marginBottom: "40px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  statCard: { background: "#fff", padding: "20px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", cursor: "pointer" },
  statIcon: { width: "60px", height: "60px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: "1.5rem", fontWeight: "600", color: "#111827" },
  viewAllButton: { background: "transparent", border: "1px solid #3b82f6", color: "#3b82f6", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500" },
  recentCard: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  courseName: { fontWeight: "600", color: "#111827", marginBottom: "5px" },
  institutionName: { color: "#6b7280", marginBottom: "5px" },
  applicationDate: { color: "#9ca3af", fontSize: "13px" },
  tipsSection: { background: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  tipsTitle: { color: "#111827", fontWeight: "600", marginBottom: "20px" },
  tipsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" },
  tipCard: { background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px solid #e5e7eb" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "#6b7280" },
  spinner: { width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" },
};

export default StudentHome;
