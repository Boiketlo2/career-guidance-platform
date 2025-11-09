// src/pages/institute/InstituteHome.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";
import { logout, isInstitution, getCurrentUser } from "../../utils/authHelper";

const InstituteHome = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const [institute, setInstitute] = useState(null);
  const [stats, setStats] = useState({
    faculties: 0,
    courses: 0,
    applications: 0,
    admissions: 0,
    pendingApplications: 0,
    approvedStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if user is actually an institution
  useEffect(() => {
    if (!isInstitution()) {
      setError("Access denied. Institution account required.");
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    fetchInstituteData();
    fetchStats();
  }, [institutionId]);

  const fetchInstituteData = async () => {
    try {
      const response = await instituteAPI.getProfile(institutionId);
      if (response.success) {
        setInstitute(response.institution);
      } else {
        setError(response.error || "Failed to load institute data");
      }
    } catch (err) {
      console.error("Error fetching institute:", err);
      if (err.response?.status === 401) {
        setError("Please login again");
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError("Access denied. Institution access required.");
      } else {
        setError("Failed to load institute data");
      }
    }
  };

  const fetchStats = async () => {
    try {
      const [facultiesRes, coursesRes, applicationsRes, admissionsRes] = await Promise.allSettled([
        instituteAPI.getFaculties(institutionId),
        instituteAPI.getCourses(institutionId),
        instituteAPI.getApplications(institutionId),
        instituteAPI.getAdmissions(institutionId),
      ]);

      // Handle each response individually
      const faculties = facultiesRes.status === 'fulfilled' ? facultiesRes.value : { success: false, count: 0, faculties: [] };
      const courses = coursesRes.status === 'fulfilled' ? coursesRes.value : { success: false, count: 0, courses: [] };
      const applications = applicationsRes.status === 'fulfilled' ? applicationsRes.value : { success: false, count: 0, applications: [] };
      const admissions = admissionsRes.status === 'fulfilled' ? admissionsRes.value : { success: false, count: 0, admissions: [] };

      const pendingApps = applications.applications?.filter(app => app.status === "pending") || [];
      const approvedStudents = applications.applications?.filter(app => app.status === "approved") || [];

      setStats({
        faculties: faculties.success ? faculties.count : 0,
        courses: courses.success ? courses.count : 0,
        applications: applications.success ? applications.count : 0,
        admissions: admissions.success ? admissions.count : 0,
        pendingApplications: pendingApps.length,
        approvedStudents: approvedStudents.length,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({
        faculties: 0,
        courses: 0,
        applications: 0,
        admissions: 0,
        pendingApplications: 0,
        approvedStudents: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleResendVerification = async () => {
    try {
      // Implement email verification if needed
      alert("Verification email functionality to be implemented");
    } catch (err) {
      alert("Failed to send verification email.");
    }
  };

  if (loading) return <div style={styles.loading}>Loading Institute Dashboard...</div>;

  return (
    <div style={styles.container}>
      {/* Header with Navigation */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Institute Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {institute?.name}</p>
        </div>
        
        <div style={styles.headerRight}>
          <nav style={styles.nav}>
            <NavLink text="🏛️ Faculties" link={`/institute/${institutionId}/faculties`} />
            <NavLink text="📚 Courses" link={`/institute/${institutionId}/courses`} />
            <NavLink text="🎓 Admissions" link={`/institute/${institutionId}/admissions`} />
            <NavLink text="📢 Publish" link={`/institute/${institutionId}/admissions/publish`} />
            <NavLink text="⚙️ Profile" link={`/institute/${institutionId}/profile`} />
          </nav>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* Verification Alert */}
      {institute && !institute.emailVerified && (
        <div style={styles.verificationAlert}>
          <span>⚠️ Please verify your email to access all features</span>
          <button style={styles.btnPrimary} onClick={handleResendVerification}>
            Resend Verification Email
          </button>
        </div>
      )}

      {/* Institute Info */}
      {institute && (
        <div style={styles.instituteCard}>
          <div style={styles.instituteHeader}>
            <h2 style={styles.instituteName}>{institute.name}</h2>
            <span style={institute.status === 'active' ? styles.activeBadge : styles.inactiveBadge}>
              {institute.status || "Active"}
            </span>
          </div>
          <div style={styles.instituteDetails}>
            <div style={styles.detailItem}>
              <strong>Email:</strong> {institute.email}
            </div>
            <div style={styles.detailItem}>
              <strong>Location:</strong> {institute.location}
            </div>
            <div style={styles.detailItem}>
              <strong>Contact:</strong> {institute.contact || "Not provided"}
            </div>
            <div style={styles.detailItem}>
              <strong>Type:</strong> {institute.type || "Private"}
            </div>
            <div style={styles.detailItem}>
              <strong>Email Verified:</strong>{" "}
              <span style={institute.emailVerified ? styles.verified : styles.unverified}>
                {institute.emailVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Section */}
      <section style={styles.statsSection}>
        <h3 style={styles.sectionTitle}>Quick Overview</h3>
        <div style={styles.grid}>
          <Card 
            icon="🏛️" 
            title="Faculties" 
            number={stats.faculties} 
            link={`/institute/${institutionId}/faculties`} 
            linkText="Manage" 
          />
          <Card 
            icon="📚" 
            title="Courses" 
            number={stats.courses} 
            link={`/institute/${institutionId}/courses`} 
            linkText="Manage" 
          />
          <Card
            icon="📝"
            title="Applications"
            number={stats.applications}
            pending={stats.pendingApplications}
            link={`/institute/${institutionId}/applications`}
            linkText="Review"
          />
          <Card 
            icon="🎓" 
            title="Approved Students" 
            number={stats.approvedStudents} 
            link={`/institute/${institutionId}/admissions`} 
            linkText="Manage" 
          />
          <Card 
            icon="📢" 
            title="Admission Cycles" 
            number={stats.admissions} 
            link={`/institute/${institutionId}/admissions`} 
            linkText="View" 
          />
        </div>
      </section>
    </div>
  );
};

// 🧱 Card Component
const Card = ({ icon, title, number, link, linkText, pending }) => (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <div style={styles.cardIcon}>{icon}</div>
      <h4 style={styles.cardTitle}>{title}</h4>
    </div>
    <div style={styles.cardContent}>
      <p style={styles.cardNumber}>{number}</p>
      {pending && pending > 0 && (
        <div style={styles.pendingBadge}>
          {pending} pending review
        </div>
      )}
    </div>
    <Link to={link} style={styles.cardLink}>
      {linkText} →
    </Link>
  </div>
);

// 🧭 Navigation Link Component
const NavLink = ({ text, link }) => (
  <Link to={link} style={styles.navLink}>{text}</Link>
);

// 💅 Styles
const styles = {
  container: { 
    maxWidth: 1200, 
    margin: "0 auto", 
    fontFamily: "Inter, sans-serif", 
    padding: "20px",
    background: "#f8f9fa",
    minHeight: "100vh"
  },
  
  // Header Styles
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "1px solid #e9ecef"
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 20
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 5px 0"
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    margin: 0
  },
  
  // Navigation Styles
  nav: {
    display: "flex",
    gap: 15,
    flexWrap: "wrap"
  },
  navLink: {
    padding: "8px 16px",
    background: "transparent",
    color: "#495057",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "14px",
    border: "1px solid #dee2e6",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap"
  },
  
  // Button Styles
  logoutBtn: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    background: "#6c757d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    whiteSpace: "nowrap"
  },
  btnPrimary: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500"
  },
  retryBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500"
  },
  
  // Alert Styles
  verificationAlert: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff3cd",
    color: "#856404",
    padding: "12px 16px",
    borderRadius: 6,
    marginBottom: 24,
    border: "1px solid #ffeaa7",
    fontSize: "14px"
  },
  error: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "12px 16px",
    borderRadius: 6,
    marginBottom: 24,
    border: "1px solid #f5c6cb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  
  // Institute Card Styles
  instituteCard: {
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: 30
  },
  instituteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  instituteName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0
  },
  instituteDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px"
  },
  detailItem: {
    fontSize: "14px",
    color: "#495057"
  },
  
  // Badge Styles
  activeBadge: {
    background: "#d4edda",
    color: "#155724",
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: "12px",
    fontWeight: "600"
  },
  inactiveBadge: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: "12px",
    fontWeight: "600"
  },
  verified: {
    background: "#d4edda",
    color: "#155724",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: "12px",
    fontWeight: "600"
  },
  unverified: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: "12px",
    fontWeight: "600"
  },
  
  // Stats Section
  statsSection: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 20px 0"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20
  },
  
  // Card Styles
  card: {
    background: "#fff",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  cardIcon: {
    fontSize: 24,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    borderRadius: 8
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#495057",
    margin: 0
  },
  cardContent: {
    marginBottom: 16
  },
  cardNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
    lineHeight: 1
  },
  pendingBadge: {
    background: "#fff3cd",
    color: "#856404",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block"
  },
  cardLink: {
    textDecoration: "none",
    color: "#007bff",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: 4,
    transition: "color 0.2s ease"
  },
  
  // Loading State
  loading: { 
    textAlign: "center", 
    padding: 100, 
    fontSize: 18,
    color: "#666"
  },
};

// Add hover effects
const navLinkHover = {
  ...styles.navLink,
  ':hover': {
    background: "#007bff",
    color: "#fff",
    borderColor: "#007bff"
  }
};

const cardHover = {
  ...styles.card,
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
  }
};

const cardLinkHover = {
  ...styles.cardLink,
  ':hover': {
    color: "#0056b3"
  }
};

// Apply hover styles
styles.navLink = navLinkHover;
styles.card = cardHover;
styles.cardLink = cardLinkHover;

export default InstituteHome;