import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const CompanyProfile = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) fetchProfile();
  }, [companyId]);

  const fetchProfile = async () => {
    try {
      setError('');
      const res = await companyAPI.getProfile(companyId);
      console.log('Profile API Response:', res);
      
      if (res?.success) {
        setCompany(res.company);
      } else {
        setError(res?.error || 'Failed to load company profile');
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError('Company not found or server error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading Company Profile...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.profileCard}>
          <div style={styles.header}>
            <h1 style={styles.title}>Company Profile</h1>
            <p style={styles.subtitle}>Company information and details</p>
          </div>
          
          {error ? (
            <div style={styles.errorContainer}>
              <div style={styles.errorText}>{error}</div>
              <p style={styles.companyId}>Company ID: {companyId}</p>
            </div>
          ) : company ? (
            <div style={styles.profileContent}>
              <div style={styles.grid}>
                <InfoField label="Company Name" value={company.name} />
                <InfoField label="Email" value={company.email} />
                <InfoField label="Industry" value={company.industry} />
                <InfoField label="Location" value={company.location} />
                <InfoField label="Contact Person" value={company.contactPerson} />
                <InfoField label="Phone" value={company.phone} />
                <InfoField label="Website" value={company.website} isLink={true} />
                <InfoField label="Status" value={company.status} 
                  badge={company.status === 'approved' ? 'success' : 
                         company.status === 'pending' ? 'warning' : 'default'} 
                />
              </div>
              
              {company.description && (
                <div style={styles.descriptionSection}>
                  <label style={styles.descriptionLabel}>
                    Company Description
                  </label>
                  <div style={styles.descriptionBox}>
                    {company.description}
                  </div>
                </div>
              )}

              <div style={styles.metaInfo}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Company ID:</span>
                  <p style={styles.metaValue}>{company.id || companyId}</p>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Registration Date:</span>
                  <p style={styles.metaValue}>{company.createdAt ? new Date(company.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not Available'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              No company information available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, isLink = false, badge = null }) => {
  if (!value) return null;

  const badgeStyles = {
    success: {
      background: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    warning: {
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde68a'
    },
    default: {
      background: '#f3f4f6',
      color: '#374151',
      border: '1px solid #e5e7eb'
    }
  };

  return (
    <div style={styles.fieldContainer}>
      <label style={styles.fieldLabel}>
        {label}
      </label>
      {badge ? (
        <span style={{
          ...styles.badge,
          ...badgeStyles[badge] || badgeStyles.default
        }}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ) : isLink ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={styles.link}
        >
          {value}
        </a>
      ) : (
        <p style={styles.fieldValue}>{value}</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "32px 20px",
    fontFamily: "'Arial', sans-serif"
  },
  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto"
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
    overflow: "hidden"
  },
  header: {
    padding: "32px 32px 24px 32px",
    borderBottom: "2px solid #f0f0f0",
    backgroundColor: "#fafafa"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px"
  },
  subtitle: {
    fontSize: "16px",
    color: "#666666",
    margin: "0",
    fontWeight: "400"
  },
  profileContent: {
    padding: "32px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "8px"
  },
  fieldContainer: {
    marginBottom: "4px"
  },
  fieldLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#555555",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  fieldValue: {
    fontSize: "16px",
    color: "#000000",
    fontWeight: "500",
    margin: "0",
    lineHeight: "1.4"
  },
  link: {
    fontSize: "16px",
    color: "#333333",
    fontWeight: "500",
    textDecoration: "none",
    borderBottom: "1px solid #333333",
    transition: "all 0.2s ease",
    display: "inline-block",
    lineHeight: "1.4"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "capitalize",
    border: "1px solid transparent"
  },
  descriptionSection: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #f0f0f0"
  },
  descriptionLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#555555",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  descriptionBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    fontSize: "15px",
    color: "#333333",
    lineHeight: "1.6",
    border: "1px solid #e8e8e8"
  },
  metaInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #f0f0f0"
  },
  metaItem: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    border: "1px solid #e8e8e8"
  },
  metaLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#666666",
    display: "block",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  metaValue: {
    fontSize: "14px",
    color: "#000000",
    fontWeight: "600",
    margin: "0",
    fontFamily: "'Courier New', monospace"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    gap: "16px"
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #333333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    fontSize: "16px",
    color: "#666666",
    fontWeight: "600"
  },
  errorContainer: {
    padding: "48px 32px",
    textAlign: "center"
  },
  errorText: {
    fontSize: "18px",
    color: "#dc2626",
    fontWeight: "600",
    marginBottom: "12px"
  },
  companyId: {
    fontSize: "14px",
    color: "#666666",
    fontWeight: "500"
  },
  emptyState: {
    padding: "48px 32px",
    textAlign: "center",
    fontSize: "16px",
    color: "#666666",
    fontWeight: "500"
  }
};

// Add CSS animation for spinner
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default CompanyProfile;
