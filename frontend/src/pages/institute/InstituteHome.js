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
  const [recentActivity, setRecentActivity] = useState([]);

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
    fetchRecentActivity();
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

  const fetchRecentActivity = async () => {
    try {
      // Mock recent activity - in real app, fetch from API
      const mockActivity = [
        { id: 1, type: 'application', message: 'New application received for Computer Science', time: '2 hours ago' },
        { id: 2, type: 'approval', message: 'Application approved for John Doe', time: '1 day ago' },
        { id: 3, type: 'course', message: 'New course "Data Analytics" published', time: '2 days ago' },
      ];
      setRecentActivity(mockActivity);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
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

  const getApplicationRate = () => {
    if (stats.applications === 0) return 0;
    return Math.round((stats.approvedStudents / stats.applications) * 100);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading Institute Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Navigation */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Institute Dashboard</h1>
            <p style={styles.subtitle}>Welcome back, {institute?.name}</p>
          </div>
          
          <div style={styles.headerRight}>
            <nav style={styles.nav}>
              <NavLink text="Faculties" link={`/institute/${institutionId}/faculties`} />
              <NavLink text="Courses" link={`/institute/${institutionId}/courses`} />
              <NavLink text="Admissions" link={`/institute/${institutionId}/admissions`} />
              <NavLink text="Publish" link={`/institute/${institutionId}/admissions/publish`} />
              <NavLink text="Profile" link={`/institute/${institutionId}/profile`} />
            </nav>
            <button 
              style={styles.logoutBtn} 
              onClick={handleLogout}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          <div style={styles.errorContent}>
            <span style={styles.errorText}>{error}</span>
            <button 
              onClick={() => window.location.reload()} 
              style={styles.retryBtn}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Verification Alert */}
      {institute && !institute.emailVerified && (
        <div style={styles.verificationAlert}>
          <div style={styles.alertContent}>
            <span style={styles.alertText}>Please verify your email to access all features</span>
            <button 
              style={styles.verifyBtn} 
              onClick={handleResendVerification}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
            >
              Resend Verification Email
            </button>
          </div>
        </div>
      )}

      {/* Institute Info */}
      {institute && (
        <div style={styles.instituteCard}>
          <div style={styles.instituteHeader}>
            <div style={styles.instituteInfo}>
              <h2 style={styles.instituteName}>{institute.name}</h2>
              <div style={styles.instituteMeta}>
                <span style={institute.status === 'active' ? styles.activeBadge : styles.inactiveBadge}>
                  {institute.status || "Active"}
                </span>
                <span style={styles.verificationStatus}>
                  {institute.emailVerified ? "✅ Verified" : "⚠️ Unverified"}
                </span>
              </div>
            </div>
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
          </div>
        </div>
      )}

      {/* Quick Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Quick Overview</h3>
          <div style={styles.performanceIndicator}>
            <span style={styles.performanceLabel}>Acceptance Rate:</span>
            <span style={styles.performanceValue}>{getApplicationRate()}%</span>
          </div>
        </div>
        <div style={styles.statsGrid}>
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
            icon="📋"
            title="Applications"
            number={stats.applications}
            pending={stats.pendingApplications}
            link={`/institute/${institutionId}/applications`}
            linkText="Review"
          />
          <Card 
            icon="✅" 
            title="Approved Students" 
            number={stats.approvedStudents} 
            link={`/institute/${institutionId}/admissions`} 
            linkText="Manage" 
          />
          <Card 
            icon="🔄" 
            title="Admission Cycles" 
            number={stats.admissions} 
            link={`/institute/${institutionId}/admissions`} 
            linkText="View" 
          />
        </div>
      </section>

      {/* Recent Activity & Quick Actions */}
      <div style={styles.bottomSection}>
        <div style={styles.activitySection}>
          <h3 style={styles.sectionTitle}>Recent Activity</h3>
          <div style={styles.activityList}>
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div key={activity.id} style={styles.activityItem}>
                  <div style={styles.activityIcon}>
                    {activity.type === 'application' ? '📥' : 
                     activity.type === 'approval' ? '✅' : '📚'}
                  </div>
                  <div style={styles.activityContent}>
                    <p style={styles.activityMessage}>{activity.message}</p>
                    <span style={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noActivity}>
                <p style={styles.noActivityText}>No recent activity</p>
                <p style={styles.noActivitySubtext}>Activity will appear here as you manage your institution</p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.actionsSection}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.actionsGrid}>
            <QuickAction 
              icon="➕"
              title="Add New Course"
              description="Create and publish a new course"
              link={`/institute/${institutionId}/courses/new`}
            />
            <QuickAction 
              icon="👥"
              title="Review Applications"
              description="Process pending applications"
              link={`/institute/${institutionId}/applications`}
            />
            <QuickAction 
              icon="📊"
              title="View Analytics"
              description="See detailed institution insights"
              link={`/institute/${institutionId}/analytics`}
            />
            <QuickAction 
              icon="⚙️"
              title="Settings"
              description="Manage institution settings"
              link={`/institute/${institutionId}/profile`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Card Component
const Card = ({ icon, title, number, link, linkText, pending }) => (
  <div 
    style={styles.card}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }}
  >
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
    <Link 
      to={link} 
      style={styles.cardLink}
      onMouseEnter={(e) => e.target.style.color = '#333'}
      onMouseLeave={(e) => e.target.style.color = '#1a1a1a'}
    >
      {linkText} →
    </Link>
  </div>
);

// Navigation Link Component
const NavLink = ({ text, link }) => (
  <Link 
    to={link} 
    style={styles.navLink}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#1a1a1a';
      e.target.style.color = '#fff';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = '#666';
    }}
  >
    {text}
  </Link>
);

// Quick Action Component
const QuickAction = ({ icon, title, description, link }) => (
  <Link 
    to={link} 
    style={styles.quickAction}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }}
  >
    <div style={styles.quickActionIcon}>{icon}</div>
    <div style={styles.quickActionContent}>
      <h4 style={styles.quickActionTitle}>{title}</h4>
      <p style={styles.quickActionDescription}>{description}</p>
    </div>
  </Link>
);

// Styles
const styles = {
  container: { 
    maxWidth: "1200px", 
    margin: "0 auto", 
    fontFamily: "'Inter', sans-serif", 
    padding: "2rem",
    background: "#f8f8f8",
    minHeight: "100vh"
  },
  
  // Header Styles
  header: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerLeft: {
    flex: "1",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "2.25rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    margin: "0",
    lineHeight: "1.5",
  },
  
  // Navigation Styles
  nav: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  navLink: {
    padding: "0.75rem 1.25rem",
    background: "transparent",
    color: "#666",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "0.9rem",
    border: "1px solid #e0e0e0",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  
  // Button Styles
  logoutBtn: {
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  verifyBtn: {
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.25rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  retryBtn: {
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.25rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  
  // Alert Styles
  verificationAlert: {
    background: "#f8f8f8",
    border: "1px solid #e0e0e0",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
  },
  alertContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  alertText: {
    color: "#666",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  error: {
    background: "#f8f0f0",
    color: "#8b2d2d",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    border: "1px solid #e8d0d0",
  },
  errorContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  errorText: {
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  
  // Institute Card Styles
  instituteCard: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
  },
  instituteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  instituteInfo: {
    flex: "1",
  },
  instituteName: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  instituteMeta: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  instituteDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1rem",
  },
  detailItem: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: "1.5",
  },
  
  // Badge Styles
  activeBadge: {
    background: "#f0f8f0",
    color: "#2d5a2d",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    border: "1px solid #d0e8d0",
  },
  inactiveBadge: {
    background: "#f8f0f0",
    color: "#8b2d2d",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    border: "1px solid #e8d0d0",
  },
  verificationStatus: {
    fontSize: "0.8rem",
    color: "#666",
    fontWeight: "500",
  },
  
  // Stats Section
  statsSection: {
    marginBottom: "2rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
  },
  performanceIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#f8f8f8",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  performanceLabel: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "500",
  },
  performanceValue: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  
  // Card Styles
  card: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  cardIcon: {
    fontSize: "1.5rem",
    width: "3rem",
    height: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f8f8",
    borderRadius: "8px",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
  },
  cardContent: {
    marginBottom: "1rem",
    flex: "1",
  },
  cardNumber: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
    lineHeight: "1",
  },
  pendingBadge: {
    background: "#f8f8f8",
    color: "#666",
    padding: "0.5rem 0.75rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
    display: "inline-block",
    border: "1px solid #e0e0e0",
  },
  cardLink: {
    textDecoration: "none",
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "color 0.2s ease",
  },
  
  // Bottom Section
  bottomSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
  },
  activitySection: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    padding: "1rem",
    background: "#f8f8f8",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  activityIcon: {
    fontSize: "1.25rem",
    marginTop: "0.25rem",
  },
  activityContent: {
    flex: "1",
  },
  activityMessage: {
    margin: "0 0 0.25rem 0",
    color: "#1a1a1a",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  activityTime: {
    color: "#999",
    fontSize: "0.8rem",
  },
  noActivity: {
    textAlign: "center",
    padding: "2rem",
    color: "#666",
  },
  noActivityText: {
    margin: "0 0 0.5rem 0",
    fontSize: "1rem",
    fontWeight: "600",
  },
  noActivitySubtext: {
    margin: "0",
    fontSize: "0.9rem",
  },
  
  // Actions Section
  actionsSection: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  actionsGrid: {
    display: "grid",
    gap: "1rem",
  },
  quickAction: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    background: "#f8f8f8",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.2s ease",
  },
  quickActionIcon: {
    fontSize: "1.5rem",
    width: "3rem",
    height: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "6px",
  },
  quickActionContent: {
    flex: "1",
  },
  quickActionTitle: {
    margin: "0 0 0.25rem 0",
    color: "#1a1a1a",
    fontSize: "1rem",
    fontWeight: "600",
  },
  quickActionDescription: {
    margin: "0",
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  
  // Loading State
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    color: "#666",
  },
  loadingText: {
    marginTop: "1rem",
    fontSize: "1rem",
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

export default InstituteHome;
