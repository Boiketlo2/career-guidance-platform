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
      pending: { bg: "#f5f5f5", text: "#666", border: "#e0e0e0" },
      approved: { bg: "#f0f8f0", text: "#2d5a2d", border: "#d0e8d0" },
      rejected: { bg: "#f8f0f0", text: "#8b2d2d", border: "#e8d0d0" },
    };
    const color = colors[status] || colors.pending;

    return (
      <span
        style={{
          background: color.bg,
          color: color.text,
          border: `1px solid ${color.border}`,
          padding: "6px 12px",
          borderRadius: "16px",
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
        <p style={styles.loadingText}>Loading Student Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Encouragement */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Dashboard</h1>
          <p style={styles.welcomeText}>
            Welcome back, <strong>{student?.name || "Student"}</strong>! 
            <span style={styles.encouragement}> Your journey to success starts here.</span>
          </p>
        </div>
      </header>

      {/* Email Verification Alert */}
      {student && !student.emailVerified && (
        <div style={styles.verificationAlert}>
          <div style={styles.alertContent}>
            <div>
              <strong style={styles.alertTitle}>Verify your email address</strong>
              <p style={styles.alertText}>Please verify your email to access all features</p>
            </div>
          </div>
          <button style={styles.verifyBtn} onClick={handleResendVerification}>
            Resend Verification
          </button>
        </div>
      )}

      {/* Encouragement Banner */}
      <div style={styles.encouragementBanner}>
        <div style={styles.encouragementContent}>
          <h3 style={styles.encouragementTitle}>Keep Moving Forward!</h3>
          <p style={styles.encouragementMessage}>
            Every application brings you closer to your dream career. Stay persistent and believe in your potential!
          </p>
        </div>
      </div>

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
        <h2 style={styles.sectionTitle}>Your Progress Overview</h2>
        <p style={styles.sectionSubtitle}>Track your applications and achievements</p>
        <div style={styles.statsGrid}>
          <StatCard title="Course Applications" value={stats.applications} color="#1a1a1a" onClick={() => navigate(`/student/${studentId}/applications`)} />
          <StatCard title="Pending Decisions" value={stats.pending} color="#666" onClick={() => navigate(`/student/${studentId}/results`)} />
          <StatCard title="Approved" value={stats.approved} color="#2d5a2d" onClick={() => navigate(`/student/${studentId}/results`)} />
          <StatCard title="Jobs Applied" value={stats.jobsApplied} color="#1a1a1a" onClick={() => navigate(`/student/${studentId}/jobs`)} />
        </div>
      </div>

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <div style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Applications</h2>
              <p style={styles.sectionSubtitle}>Stay updated on your latest submissions</p>
            </div>
            <button style={styles.viewAllButton} onClick={() => navigate(`/student/${studentId}/applications`)}>
              View All
            </button>
          </div>
          <div style={styles.recentList}>
            {recentApplications.map((app, index) => (
              <div key={app.id || index} style={styles.recentCard}>
                <div style={styles.recentCardContent}>
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

      {/* Tips & Encouragement */}
      <div style={styles.tipsSection}>
        <h3 style={styles.tipsTitle}>Success Tips & Motivation</h3>
        <div style={styles.tipsGrid}>
          <div style={styles.tipCard}>
            <h4 style={styles.tipTitle}>Complete Your Profile</h4>
            <p style={styles.tipText}>Ensure your profile is up-to-date for better job matches and application success.</p>
          </div>
          <div style={styles.tipCard}>
            <h4 style={styles.tipTitle}>Upload Documents</h4>
            <p style={styles.tipText}>Add your transcripts and certificates to streamline your application process.</p>
          </div>
          <div style={styles.tipCard}>
            <h4 style={styles.tipTitle}>Track Applications</h4>
            <p style={styles.tipText}>Regularly check your application status and follow up when needed.</p>
          </div>
          <div style={styles.tipCard}>
            <h4 style={styles.tipTitle}>Stay Persistent</h4>
            <p style={styles.tipText}>Every 'no' brings you closer to a 'yes'. Keep applying and learning!</p>
          </div>
        </div>
      </div>

      {/* Final Encouragement */}
      <div style={styles.finalEncouragement}>
        <p style={styles.finalEncouragementText}>
          <strong>Remember:</strong> Your dedication today builds your success tomorrow. 
          Keep pushing forward – you've got this! 
        </p>
      </div>
    </div>
  );
};

/* Components */
const QuickLink = ({ label, description, to, navigate }) => (
  <button 
    style={styles.quickLink} 
    onClick={() => navigate(to)}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }}
  >
    <div>
      <h4 style={styles.quickLinkTitle}>{label}</h4>
      <p style={styles.quickLinkDescription}>{description}</p>
    </div>
    <span style={styles.quickLinkArrow}>→</span>
  </button>
);

const StatCard = ({ title, value, color, onClick }) => (
  <div 
    style={styles.statCard} 
    onClick={onClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }}
  >
    <div style={{ ...styles.statIcon, backgroundColor: color + '1A', color }}>
      {value}
    </div>
    <div>
      <h4 style={styles.statTitle}>{title}</h4>
    </div>
  </div>
);

/* Styles */
const styles = {
  container: { 
    background: "#f8f8f8", 
    minHeight: "100vh", 
    padding: "2rem", 
    fontFamily: "'Inter', sans-serif" 
  },
  header: { 
    marginBottom: "2rem" 
  },
  title: { 
    fontSize: "2.25rem", 
    fontWeight: "700", 
    color: "#1a1a1a", 
    marginBottom: "0.5rem" 
  },
  welcomeText: { 
    fontSize: "1.1rem", 
    color: "#666",
    lineHeight: "1.5" 
  },
  encouragement: {
    color: "#1a1a1a",
    fontWeight: "500",
    fontStyle: "italic"
  },
  verificationAlert: { 
    background: "#fff8e1", 
    border: "1px solid #e0e0e0", 
    borderLeft: "4px solid #d4b300", 
    padding: "1.25rem", 
    borderRadius: "8px", 
    marginBottom: "2rem", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  alertTitle: {
    color: "#1a1a1a",
    fontSize: "1rem"
  },
  alertText: {
    color: "#666",
    margin: "0.25rem 0 0 0",
    fontSize: "0.9rem"
  },
  verifyBtn: { 
    background: "#1a1a1a", 
    color: "#fff", 
    border: "none", 
    padding: "0.75rem 1.5rem", 
    borderRadius: "6px", 
    fontWeight: "600", 
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  encouragementBanner: {
    background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
    color: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    textAlign: "center"
  },
  encouragementTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#fff"
  },
  encouragementMessage: {
    fontSize: "1rem",
    opacity: "0.9",
    margin: "0",
    lineHeight: "1.5"
  },
  quickNav: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
    gap: "1.25rem", 
    marginBottom: "2.5rem" 
  },
  quickLink: { 
    background: "#fff", 
    border: "1px solid #e0e0e0", 
    padding: "1.5rem", 
    borderRadius: "8px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    width: "100%"
  },
  quickLinkTitle: { 
    margin: "0 0 0.5rem 0", 
    color: "#1a1a1a", 
    fontSize: "1rem",
    fontWeight: "600"
  },
  quickLinkDescription: { 
    color: "#666", 
    fontSize: "0.875rem",
    margin: "0",
    lineHeight: "1.4"
  },
  quickLinkArrow: { 
    color: "#999", 
    fontSize: "1.125rem",
    fontWeight: "600"
  },
  statsSection: { 
    marginBottom: "2.5rem" 
  },
  sectionTitle: { 
    fontSize: "1.5rem", 
    fontWeight: "600", 
    color: "#1a1a1a",
    marginBottom: "0.5rem"
  },
  sectionSubtitle: {
    color: "#666",
    fontSize: "0.9rem",
    marginBottom: "1.5rem"
  },
  statsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
    gap: "1.25rem" 
  },
  statCard: { 
    background: "#fff", 
    padding: "1.5rem", 
    borderRadius: "8px", 
    display: "flex", 
    alignItems: "center", 
    gap: "1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", 
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #f0f0f0"
  },
  statIcon: { 
    width: "60px", 
    height: "60px", 
    borderRadius: "8px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: "1.125rem", 
    fontWeight: "700" 
  },
  statTitle: { 
    margin: 0, 
    color: "#1a1a1a",
    fontSize: "0.9rem",
    fontWeight: "600"
  },
  sectionHeader: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    marginBottom: "1.5rem"
  },
  viewAllButton: { 
    background: "transparent", 
    border: "1px solid #1a1a1a", 
    color: "#1a1a1a", 
    padding: "0.75rem 1.5rem", 
    borderRadius: "6px", 
    cursor: "pointer", 
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  recentCard: { 
    background: "#fff", 
    padding: "1.5rem", 
    borderRadius: "8px", 
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "1rem",
    border: "1px solid #f0f0f0"
  },
  recentCardContent: {
    flex: "1"
  },
  courseName: { 
    fontWeight: "600", 
    color: "#1a1a1a", 
    marginBottom: "0.5rem",
    fontSize: "1rem"
  },
  institutionName: { 
    color: "#666", 
    marginBottom: "0.5rem",
    fontSize: "0.9rem"
  },
  applicationDate: { 
    color: "#999", 
    fontSize: "0.8rem",
    margin: "0"
  },
  tipsSection: { 
    background: "#fff", 
    padding: "2rem", 
    borderRadius: "8px", 
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #f0f0f0"
  },
  tipsTitle: { 
    color: "#1a1a1a", 
    fontWeight: "600", 
    marginBottom: "1.5rem",
    fontSize: "1.25rem"
  },
  tipsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
    gap: "1.25rem" 
  },
  tipCard: { 
    background: "#f8f8f8", 
    padding: "1.5rem", 
    borderRadius: "8px", 
    border: "1px solid #e0e0e0" 
  },
  tipTitle: { 
    margin: "0 0 0.75rem 0", 
    color: "#1a1a1a",
    fontSize: "1rem",
    fontWeight: "600"
  },
  tipText: { 
    color: "#666", 
    lineHeight: "1.5",
    margin: "0",
    fontSize: "0.9rem"
  },
  finalEncouragement: {
    background: "linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)",
    border: "1px solid #e0e0e0",
    padding: "1.5rem",
    borderRadius: "8px",
    textAlign: "center"
  },
  finalEncouragementText: {
    color: "#1a1a1a",
    fontSize: "1rem",
    margin: "0",
    lineHeight: "1.5",
    fontStyle: "italic"
  },
  loadingContainer: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    height: "100vh", 
    color: "#666" 
  },
  loadingText: {
    marginTop: "1rem",
    fontSize: "1rem"
  },
  spinner: { 
    width: "40px", 
    height: "40px", 
    border: "4px solid #e0e0e0", 
    borderTop: "4px solid #1a1a1a", 
    borderRadius: "50%", 
    animation: "spin 1s linear infinite", 
  },
};

export default StudentHome;
