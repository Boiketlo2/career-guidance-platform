import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/adminAPI";

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getCompanies();
      if (res.success) setCompanies(res.companies);
      else setError(res.error || "Failed to fetch companies");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = async (id, companyName) => {
    setUpdating(id);
    setError("");
    try {
      await adminAPI.approveCompany(id);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      setError(`Failed to approve ${companyName}. Please try again.`);
    } finally {
      setUpdating(null);
    }
  };

  const getStats = () => {
    const total = companies.length;
    const approved = companies.filter(c => c.approved).length;
    const pending = total - approved;
    return { total, approved, pending };
  };

  const stats = getStats();

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Manage Companies</h1>
          <p style={styles.subtitle}>Review and approve company registrations for platform access</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Companies</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statNumber}>{stats.approved}</div>
          <div style={styles.statLabel}>Approved</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statNumber}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending Review</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}></div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
          <button onClick={fetchCompanies} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.mainContent}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading Companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}></div>
            <h3 style={styles.emptyTitle}>No Companies Found</h3>
            <p style={styles.emptyText}>
              {error ? "Unable to load companies. Please try again." : "No companies have registered yet."}
            </p>
            <button onClick={fetchCompanies} style={styles.refreshButton}>
              Refresh
            </button>
          </div>
        ) : (
          <div style={styles.companiesGrid}>
            {companies.map((company) => (
              <div 
                key={company.id} 
                style={styles.companyCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.companyAvatar}>
                    {company.name?.charAt(0) || 'C'}
                  </div>
                  <div style={styles.companyInfo}>
                    <h3 style={styles.companyName}>{company.name}</h3>
                    <p style={styles.companyEmail}>{company.email || 'No email provided'}</p>
                  </div>
                </div>

                <div style={styles.companyDetails}>
                  {company.industry && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Industry:</span>
                      <span style={styles.detailValue}>{company.industry}</span>
                    </div>
                  )}
                  {company.location && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Location:</span>
                      <span style={styles.detailValue}>{company.location}</span>
                    </div>
                  )}
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Status:</span>
                    <span style={company.approved ? styles.statusApproved : styles.statusPending}>
                      {company.approved ? "Approved" : "Pending Approval"}
                    </span>
                  </div>
                </div>

                {!company.approved && (
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleApprove(company.id, company.name)}
                      disabled={updating === company.id}
                      style={updating === company.id ? styles.approveButtonDisabled : styles.approveButton}
                    >
                      {updating === company.id ? (
                        <div style={styles.buttonContent}>
                          <div style={styles.smallSpinner}></div>
                          Approving...
                        </div>
                      ) : (
                        " Approve Company"
                      )}
                    </button>
                  </div>
                )}

                {company.approved && (
                  <div style={styles.approvedBadge}>
                    ✓ Approved
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fafbfc',
    padding: '0 20px 40px 20px',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    background: '#ffffff',
    padding: '40px 0',
    marginBottom: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderBottom: '1px solid #e1e5e9'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '0 20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    margin: 0,
    fontWeight: '400',
    lineHeight: '1.5'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto 32px auto'
  },
  statCard: {
    background: '#ffffff',
    padding: '24px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9',
    textAlign: 'center',
    transition: 'all 0.2s ease'
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '12px'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  error: {
    background: '#fef2f2',
    padding: '20px',
    borderRadius: '8px',
    color: '#dc2626',
    margin: '0 auto 24px auto',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '1200px'
  },
  errorIcon: {
    fontSize: '16px',
    flexShrink: 0
  },
  errorContent: {
    flex: 1
  },
  errorTitle: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '600'
  },
  errorMessage: {
    fontSize: '14px',
    opacity: 0.9
  },
  retryButton: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center'
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
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '24px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0'
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 24px 0',
    lineHeight: '1.5'
  },
  refreshButton: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  companiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  companyCard: {
    background: '#ffffff',
    padding: '28px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px'
  },
  companyAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#1a1a1a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '18px',
    flexShrink: 0
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
    lineHeight: '1.3'
  },
  companyEmail: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  companyDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '14px',
    color: '#1a1a1a',
    fontWeight: '400'
  },
  statusApproved: {
    fontSize: '13px',
    color: '#0f7a0f',
    fontWeight: '600',
    background: '#f0f9f0',
    padding: '4px 8px',
    borderRadius: '12px',
    border: '1px solid #e1f5e1'
  },
  statusPending: {
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: '600',
    background: '#fef2f2',
    padding: '4px 8px',
    borderRadius: '12px',
    border: '1px solid #fecaca'
  },
  cardActions: {
    marginTop: '16px',
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f0'
  },
  approveButton: {
    background: '#0f7a0f',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  approveButtonDisabled: {
    background: '#8c8c8c',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '14px',
    width: '100%'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  smallSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  approvedBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: '#f0f9f0',
    color: '#0f7a0f',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #e1f5e1'
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

export default ManageCompanies;
