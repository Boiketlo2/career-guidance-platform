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
        studentAPI.getAdmissionResults(studentId), // Now using the fixed function
        studentAPI.getAllJobs()
      ]);

      console.log("Student data responses:", { profileRes, applicationsRes, admissionsRes, jobsRes });

      // Set student profile
      if (profileRes?.success) {
        setStudent(profileRes.student);
      }

      // Set recent applications (last 3)
      if (applicationsRes?.success) {
        const apps = applicationsRes.applications || [];
        setRecentApplications(apps.slice(0, 3));
      }

      // Calculate stats - now using admission results for status counts
      const apps = applicationsRes?.applications || [];
      const admissions = admissionsRes?.results || []; // Using results from getAdmissionResults
      const jobs = jobsRes?.jobs || [];

      const jobsApplied = jobs.filter(job => 
        job.applicants?.includes(studentId)
      ).length;

      setStats({
        applications: apps.length,
        pending: admissions.filter(a => a.status === "pending").length,
        approved: admissions.filter(a => a.status === "approved").length,
        rejected: admissions.filter(a => a.status === "rejected").length,
        jobsApplied: jobsApplied,
      });
    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the StudentHome.js code remains the same
  // (handleLogout, handleResendVerification, getStatusBadge, components, and styles)

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
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
    const statusStyles = {
      pending: { background: "#fef3c7", color: "#92400e" },
      approved: { background: "#d1fae5", color: "#065f46" },
      rejected: { background: "#fee2e2", color: "#991b1b" }
    };
    
    const style = statusStyles[status] || statusStyles.pending;
    return (
      <span style={{
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        ...style
      }}>
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
          <p style={styles.welcomeText}>
            Welcome back, {student?.name || "Student"}! 
          </p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Email Verification Alert */}
      {student && !student.emailVerified && (
        <div style={styles.verificationAlert}>
          <div style={styles.alertContent}>
            <span style={styles.alertIcon}>⚠️</span>
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
        <QuickLink 
          label=" Apply for Courses" 
          description="Browse and apply to courses" 
          to={`/student/${studentId}/apply`} 
          navigate={navigate} 
        />
      
        <QuickLink 
          label="Admission Results" 
          description="See your admission decisions" 
          to={`/student/${studentId}/results`} 
          navigate={navigate} 
        />
        <QuickLink 
          label=" Browse Jobs" 
          description="Find career opportunities" 
          to={`/student/${studentId}/jobs`} 
          navigate={navigate} 
        />
        <QuickLink 
          label=" Upload Documents" 
          description="Manage your transcripts & certificates" 
          to={`/student/${studentId}/upload`} 
          navigate={navigate} 
        />
        <QuickLink 
          label=" Update Profile" 
          description="Edit your personal information" 
          to={`/student/${studentId}/profile`} 
          navigate={navigate} 
        />
      </nav>

      {/* Stats Overview */}
      <div style={styles.statsSection}>
        <h2 style={styles.sectionTitle}>Overview</h2>
        <div style={styles.statsGrid}>
          <StatCard
            title="Course Applications"
            value={stats.applications}
            icon=""
            color="#3b82f6"
            onClick={() => navigate(`/student/${studentId}/applications`)}
          />
          <StatCard
            title="Pending Decisions"
            value={stats.pending}
            icon=""
            color="#f59e0b"
            onClick={() => navigate(`/student/${studentId}/results`)}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon=""
            color="#10b981"
            onClick={() => navigate(`/student/${studentId}/results`)}
          />
          <StatCard
            title="Jobs Applied"
            value={stats.jobsApplied}
            icon=""
            color="#8b5cf6"
            onClick={() => navigate(`/student/${studentId}/jobs`)}
          />
        </div>
      </div>

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <div style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Applications</h2>
            <button 
              style={styles.viewAllButton}
              onClick={() => navigate(`/student/${studentId}/applications`)}
            >
              View All
            </button>
          </div>
          <div style={styles.applicationsList}>
            {recentApplications.map((app, index) => (
              <div key={app.id || index} style={styles.applicationCard}>
                <div style={styles.applicationInfo}>
                  <h4 style={styles.courseName}>{app.courseName}</h4>
                  <p style={styles.institutionName}>{app.institutionName}</p>
                  <p style={styles.applicationDate}>
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={styles.applicationStatus}>
                  {getStatusBadge(app.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div style={styles.tipsSection}>
        <h3 style={styles.tipsTitle}> Quick Tips</h3>
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

// QuickLink Component
const QuickLink = ({ label, description, to, navigate }) => (
  <button
    style={styles.quickLinkCard}
    onClick={() => navigate(to)}
  >
    <div style={styles.quickLinkContent}>
      <span style={styles.quickLinkIcon}>{label.split(' ')[0]}</span>
      <div>
        <div style={styles.quickLinkLabel}>{label.split(' ').slice(1).join(' ')}</div>
        <div style={styles.quickLinkDesc}>{description}</div>
      </div>
    </div>
    <span style={styles.quickLinkArrow}>→</span>
  </button>
);

// StatCard Component
const StatCard = ({ title, value, icon, color, onClick }) => (
  <div style={styles.statCard} onClick={onClick}>
    <div style={{...styles.statIcon, backgroundColor: color + '20', color }}>
      {icon}
    </div>
    <div style={styles.statContent}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  </div>
);

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0",
  },
  welcomeText: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: "5px 0 0 0",
  },
  logoutBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 6px rgba(239, 68, 68, 0.25)",
  },
  verificationAlert: {
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    border: "1px solid #f59e0b",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  alertContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  alertIcon: {
    fontSize: "24px",
  },
  verifyBtn: {
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  quickNav: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  quickLinkCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    border: "none",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  quickLinkContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  quickLinkIcon: {
    fontSize: "24px",
  },
  quickLinkLabel: {
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },
  quickLinkDesc: {
    fontSize: "14px",
    color: "#64748b",
  },
  quickLinkArrow: {
    color: "#64748b",
    fontSize: "18px",
  },
  statsSection: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 20px 0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  statIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  statContent: {
    flex: "1",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: "1",
  },
  statTitle: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
    marginTop: "5px",
  },
  recentSection: {
    marginBottom: "40px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  viewAllButton: {
    background: "transparent",
    color: "#3b82f6",
    border: "1px solid #3b82f6",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  applicationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  applicationCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  applicationInfo: {
    flex: "1",
  },
  courseName: {
    margin: "0 0 5px 0",
    color: "#1e293b",
    fontWeight: "600",
  },
  institutionName: {
    margin: "0 0 5px 0",
    color: "#64748b",
    fontSize: "14px",
  },
  applicationDate: {
    margin: "0",
    color: "#94a3b8",
    fontSize: "12px",
  },
  applicationStatus: {
    marginLeft: "15px",
  },
  tipsSection: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  tipsTitle: {
    margin: "0 0 20px 0",
    color: "#1e293b",
    fontSize: "1.2rem",
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  tipCard: {
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
};

export default StudentHome;