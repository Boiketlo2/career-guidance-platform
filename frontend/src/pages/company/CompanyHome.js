import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const CompanyHome = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    jobsPosted: 0,
    totalApplicants: 0,
    activeJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) {
      fetchCompanyProfile();
      fetchCompanyStats();
    }
  }, [companyId]);

  const fetchCompanyProfile = async () => {
    try {
      setError('');
      const res = await companyAPI.getProfile(companyId);
      console.log('Company Profile Response:', res);
      
      if (res?.success) {
        setCompany(res.company);
      } else {
        setError(res?.error || 'Failed to load company profile');
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError('Company not found or server error');
    }
  };

  const fetchCompanyStats = async () => {
    try {
      setError('');
      const res = await companyAPI.getJobs(companyId);
      console.log('Jobs Response:', res);
      
      if (res?.success && res.jobs) {
        let totalApplicants = 0;
        res.jobs.forEach(job => {
          totalApplicants += job.applicants?.length || 0;
        });
        
        setStats({
          jobsPosted: res.jobs.length,
          totalApplicants,
          activeJobs: res.jobs.filter(job => job.status === 'active').length
        });
      } else {
        setError(res?.error || 'Failed to load company stats');
      }
    } catch (err) {
      console.error("Error fetching company stats:", err);
      setError('Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Company Dashboard...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>Company Dashboard</h1>
            <p style={styles.subtitle}>
              {company?.name || `Company ID: ${companyId}`}
            </p>
          </div>
          <nav style={styles.navigation}>
            <button 
              onClick={() => navigate(`/company/${companyId}/jobs`)} 
              style={styles.navButton}
            >
              📋 Manage Jobs
            </button>
            <button 
              onClick={() => navigate(`/company/${companyId}/applicants`)} 
              style={styles.navButton}
            >
              👥 Applicants
            </button>
            <button 
              onClick={() => navigate(`/company/${companyId}/profile`)} 
              style={styles.navButton}
            >
              ⚙️ Profile
            </button>
          </nav>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
            <p style={styles.errorHelp}>
              Please check if the company ID is correct and try again.
            </p>
          </div>
          <button onClick={fetchCompanyProfile} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={styles.mainContent}>
        {!error && (
          <>
            <div style={styles.welcomeSection}>
              <h2 style={styles.welcomeTitle}>
                Welcome back{company?.name ? `, ${company.name}` : ''}!
              </h2>
              <p style={styles.welcomeText}>
                Here's an overview of your recruitment activities and performance metrics.
              </p>
            </div>

            <div style={styles.statsGrid}>
              <StatCard
                title="Active Jobs"
                value={stats.activeJobs}
                description="Currently open positions"
                icon="💼"
                color="#0f7a0f"
              />
              <StatCard
                title="Total Applicants"
                value={stats.totalApplicants}
                description="All applications received"
                icon="👥"
                color="#0369a1"
              />
              <StatCard
                title="Jobs Posted"
                value={stats.jobsPosted}
                description="Total job postings"
                icon="📊"
                color="#1a1a1a"
              />
            </div>

            {/* Quick Actions */}
            <div style={styles.actionsSection}>
              <h3 style={styles.sectionTitle}>Quick Actions</h3>
              <div style={styles.actionsGrid}>
                <button 
                  onClick={() => navigate(`/company/${companyId}/jobs/new`)}
                  style={styles.actionButton}
                >
                  <div style={styles.actionIcon}>➕</div>
                  <div style={styles.actionContent}>
                    <div style={styles.actionTitle}>Post New Job</div>
                    <div style={styles.actionDescription}>Create a new job listing</div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate(`/company/${companyId}/applicants`)}
                  style={styles.actionButton}
                >
                  <div style={styles.actionIcon}>📋</div>
                  <div style={styles.actionContent}>
                    <div style={styles.actionTitle}>Review Applications</div>
                    <div style={styles.actionDescription}>View and manage applicants</div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate(`/company/${companyId}/profile`)}
                  style={styles.actionButton}
                >
                  <div style={styles.actionIcon}>🏢</div>
                  <div style={styles.actionContent}>
                    <div style={styles.actionTitle}>Update Profile</div>
                    <div style={styles.actionDescription}>Edit company information</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, description, icon, color }) => {
  return (
    <div style={styles.statCard}>
      <div style={styles.statHeader}>
        <div style={styles.statIcon}>{icon}</div>
        <div style={{...styles.statValue, color: color}}>{value}</div>
      </div>
      <div style={styles.statContent}>
        <h3 style={styles.statTitle}>{title}</h3>
        <p style={styles.statDescription}>{description}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fafbfc',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    background: '#ffffff',
    padding: '24px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderBottom: '1px solid #e1e5e9'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerInfo: {
    flex: 1
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
    fontWeight: '400'
  },
  navigation: {
    display: 'flex',
    gap: '12px'
  },
  navButton: {
    background: 'transparent',
    color: '#333',
    border: '1px solid #d0d7de',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '0 20px'
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0'
  },
  welcomeText: {
    fontSize: '18px',
    color: '#666',
    margin: 0,
    lineHeight: '1.6',
    maxWidth: '600px',
    margin: '0 auto'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '48px'
  },
  statCard: {
    background: '#ffffff',
    padding: '32px 24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  statIcon: {
    fontSize: '32px'
  },
  statValue: {
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1'
  },
  statContent: {
    textAlign: 'center'
  },
  statTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  statDescription: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: '1.5'
  },
  actionsSection: {
    background: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 24px 0'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  actionButton: {
    background: 'transparent',
    border: '1px solid #e1e5e9',
    padding: '24px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%'
  },
  actionIcon: {
    fontSize: '32px',
    marginBottom: '16px'
  },
  actionContent: {
    textAlign: 'left'
  },
  actionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  actionDescription: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: '1.5'
  },
  error: {
    background: '#fef2f2',
    padding: '24px',
    borderRadius: '8px',
    color: '#dc2626',
    margin: '24px 20px',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    maxWidth: '1200px',
    margin: '24px auto'
  },
  errorIcon: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '2px'
  },
  errorContent: {
    flex: 1
  },
  errorTitle: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: '600'
  },
  errorMessage: {
    fontSize: '15px',
    marginBottom: '8px',
    opacity: 0.9
  },
  errorHelp: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    opacity: 0.8
  },
  retryButton: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    background: '#fafbfc'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #1a1a1a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  }
};

// Add CSS for spinner animation
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default CompanyHome;
