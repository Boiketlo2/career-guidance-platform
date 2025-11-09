// src/pages/company/CompanyHome.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";
import { authAPI } from "../../api/authAPI";

const CompanyHome = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    jobsPosted: 0,
    applicants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchCompanyProfile();
      fetchCompanyStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Fetch company profile
  const fetchCompanyProfile = async () => {
    try {
      const res = await companyAPI.getProfile(companyId);
      if (res?.success) setCompany(res.company);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch company stats
  const fetchCompanyStats = async () => {
    try {
      const jobs = await companyAPI.getJobs(companyId);
      const applicants = await companyAPI.getApplicants(companyId);
      setStats({
        jobsPosted: jobs?.length || 0,
        applicants: applicants?.length || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  const handleResendVerification = async () => {
    try {
      const res = await authAPI.verifyEmail(companyId);
      alert(res.success ? "Verification email sent." : "Failed to send email.");
    } catch {
      alert("Error sending verification email.");
    }
  };

  if (loading)
    return <div style={styles.loading}>Loading Company Dashboard...</div>;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1>Company Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* QUICK LINKS */}
      <nav style={styles.quickNav}>
        <QuickLink
          label="📌 Post a Job"
          to={`/company/${companyId}/post-job`}
        />
        <QuickLink
          label="📝 Manage Jobs"
          to={`/company/${companyId}/jobs`}
        />
        <QuickLink
          label="👥 View Applicants"
          to={`/company/${companyId}/applicants`}
        />
        <QuickLink
          label="👤 Update Profile"
          to={`/company/${companyId}/profile`}
        />
      </nav>

      {/* EMAIL VERIFICATION ALERT */}
      {company && !company.emailVerified && (
        <div style={styles.verificationAlert}>
          ⚠️ Please verify your email{" "}
          <button style={styles.verifyBtn} onClick={handleResendVerification}>
            Resend Verification
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div style={styles.cardsGrid}>
        <StatCard
          title="Company"
          value={company?.name || "Company"}
          onClick={() => navigate(`/company/${companyId}/profile`)}
        />
        <StatCard
          title="Jobs Posted"
          value={stats.jobsPosted}
          onClick={() => navigate(`/company/${companyId}/jobs`)}
        />
        <StatCard
          title="Applicants"
          value={stats.applicants}
          onClick={() => navigate(`/company/${companyId}/applicants`)}
        />
      </div>
    </div>
  );
};

// -------------------------
// Quick link component
// -------------------------
const QuickLink = ({ label, to }) => (
  <button style={styles.quickLinkBtn} onClick={() => (window.location.href = to)}>
    {label}
  </button>
);

// -------------------------
// Stat card component
// -------------------------
const StatCard = ({ title, value, onClick }) => (
  <div style={styles.card} onClick={onClick}>
    <h3>{title}</h3>
    <p style={styles.cardValue}>{value}</p>
  </div>
);

// -------------------------
// Internal Styles
// -------------------------
const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f7f9fc",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  logoutBtn: {
    background: "#f44336",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  quickNav: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  quickLinkBtn: {
    background: "#2196f3",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1,
    minWidth: "160px",
  },
  verificationAlert: {
    background: "#fff3cd",
    color: "#856404",
    padding: "10px 16px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  verifyBtn: {
    marginLeft: "10px",
    padding: "4px 8px",
    background: "#ffc107",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    cursor: "pointer",
    textAlign: "center",
    transition: "transform 0.2s",
  },
  cardValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginTop: "10px",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    fontSize: "1.2rem",
  },
};

export default CompanyHome;
