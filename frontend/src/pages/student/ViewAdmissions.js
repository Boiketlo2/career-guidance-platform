import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { studentAPI } from "../../api/studentAPI";

const ViewAdmissions = () => {
  const { studentId } = useParams();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAdmissions();
  }, [studentId]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log(" [ViewAdmissions] Starting to fetch admission results for student:", studentId);
      
      const res = await studentAPI.getAdmissionResults(studentId);
      console.log(" [ViewAdmissions] RAW API Response:", res);
      
      if (res?.success) {
        const admissionsData = res.results || [];
        console.log(" [ViewAdmissions] Processed admissions data:", admissionsData);
        
        setAdmissions(admissionsData);
        setLastUpdated(new Date());
        
        // Calculate stats
        const statsData = {
          total: admissionsData.length,
          approved: admissionsData.filter(app => app.status === "approved").length,
          pending: admissionsData.filter(app => app.status === "pending").length,
          rejected: admissionsData.filter(app => app.status === "rejected").length
        };
        
        setStats(statsData);
        console.log(" [ViewAdmissions] Calculated stats:", statsData);
        
        // Set debug info
        setDebugInfo({
          apiResponse: res,
          processedData: admissionsData,
          stats: statsData,
          timestamp: new Date().toISOString()
        });
        
      } else {
        console.error(" [ViewAdmissions] API returned success: false", res?.error);
        setError(res?.error || "Failed to fetch admissions");
      }
    } catch (err) {
      console.error(" [ViewAdmissions] Error fetching admissions:", err);
      setError(err.message || "Failed to load admission results");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': 
        return { 
          backgroundColor: "#f0f8f0",
          color: "#2d5a2d",
          borderColor: "#d0e8d0",
          icon: ""
        };
      case 'rejected': 
        return { 
          backgroundColor: "#f8f0f0",
          color: "#8b2d2d",
          borderColor: "#e8d0d0",
          icon: ""
        };
      default: 
        return { 
          backgroundColor: "#f8f8f8",
          color: "#666",
          borderColor: "#e0e0e0",
          icon: ""
        };
    }
  };

  const getFilteredAdmissions = () => {
    if (filter === "all") return admissions;
    return admissions.filter(app => app.status === filter);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const AdmissionCard = ({ admission }) => {
    const statusStyle = getStatusStyle(admission.status);
    
    return (
      <div 
        style={styles.admissionCard}
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
          <div style={styles.courseInfo}>
            <h3 style={styles.courseName}>{admission.courseName || "Unknown Course"}</h3>
            <p style={styles.institutionName}>{admission.institutionName || "Unknown Institution"}</p>
            <div style={styles.metaInfo}>
              <span style={styles.applicationId}>Application ID: {admission.id}</span>
              {admission.updatedAt && (
                <span style={styles.updateTime}>Updated {getTimeAgo(admission.updatedAt)}</span>
              )}
            </div>
          </div>
          <div style={{
            ...styles.statusBadge,
            backgroundColor: statusStyle.backgroundColor,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.borderColor}`
          }}>
            <span style={styles.statusIcon}>{statusStyle.icon}</span>
            {admission.status ? admission.status.charAt(0).toUpperCase() + admission.status.slice(1) : "Unknown"}
          </div>
        </div>
        
        <div style={styles.cardDetails}>
          <div style={styles.detailGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Applied Date:</span>
              <span style={styles.detailValue}>
                {formatDate(admission.appliedAt)}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Last Updated:</span>
              <span style={styles.detailValue}>
                {formatDate(admission.updatedAt || admission.appliedAt)}
              </span>
            </div>
          </div>
          {admission.personalStatement && (
            <div style={styles.personalStatement}>
              <span style={styles.detailLabel}>Personal Statement:</span>
              <p style={styles.statementText}>{admission.personalStatement}</p>
            </div>
          )}
        </div>

        {admission.status === "approved" && (
          <div style={styles.approvedMessage}>
            <span style={styles.approvedIcon}></span>
            <div>
              <strong>Congratulations!</strong> You've been accepted into this program. 
              You'll receive further instructions from the institution via email.
            </div>
          </div>
        )}

        {admission.status === "rejected" && (
          <div style={styles.rejectedMessage}>
            <span style={styles.rejectedIcon}></span>
            <div>
              <strong>Keep Going!</strong> This is just one opportunity. 
              Many more await - continue exploring and applying to other programs.
            </div>
          </div>
        )}

        {admission.status === "pending" && (
          <div style={styles.pendingMessage}>
            <span style={styles.pendingIcon}>📋</span>
            <div>
              <strong>Under Review</strong> - The institution is currently reviewing your application. 
              Check back regularly for updates.
            </div>
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, color, onClick, isActive }) => (
    <div 
      style={{
        ...styles.statCard,
        borderLeft: `4px solid ${color}`,
        ...(isActive ? styles.statCardActive : {})
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading admission results...</p>
        <p style={styles.debugText}>Student ID: {studentId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}></div>
        <h3 style={styles.errorTitle}>Error Loading Admissions</h3>
        <p style={styles.errorMessage}>{error}</p>
        <div style={styles.errorActions}>
          <button 
            style={styles.retryButton}
            onClick={fetchAdmissions}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
            Try Again
          </button>
        </div>
        <p style={styles.debugText}>Student ID: {studentId}</p>
      </div>
    );
  }

  const filteredAdmissions = getFilteredAdmissions();

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Admission Results</h1>
          <p style={styles.subtitle}>Track your course application status and decisions</p>
          {lastUpdated && (
            <p style={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div style={styles.stats}>
          <StatCard 
            title="Total Applications" 
            value={stats.total} 
            color="#1a1a1a"
            onClick={() => setFilter("all")}
            isActive={filter === "all"}
          />
          <StatCard 
            title="Approved" 
            value={stats.approved} 
            color="#2d5a2d"
            onClick={() => setFilter("approved")}
            isActive={filter === "approved"}
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            color="#666"
            onClick={() => setFilter("pending")}
            isActive={filter === "pending"}
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected} 
            color="#8b2d2d"
            onClick={() => setFilter("rejected")}
            isActive={filter === "rejected"}
          />
        </div>
      </div>

      {/* Control Section */}
      <div style={styles.controlSection}>
        <div style={styles.controlGroup}>
          <button 
            style={styles.refreshButton}
            onClick={fetchAdmissions}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
             Refresh Results
          </button>
          <div style={styles.resultsInfo}>
            Showing {filteredAdmissions.length} of {stats.total} application{stats.total !== 1 ? 's' : ''}
            {filter !== 'all' && ` (${filter})`}
          </div>
        </div>
      </div>

      {/* Admissions List */}
      <div style={styles.admissionsList}>
        {filteredAdmissions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              {filter === "all" ? "" : 
               filter === "approved" ? "" :
               filter === "pending" ? "" : ""}
            </div>
            <h3 style={styles.emptyTitle}>
              {filter === "all" ? "No Applications Yet" :
               filter === "approved" ? "No Approved Applications" :
               filter === "pending" ? "No Pending Applications" : "No Rejected Applications"}
            </h3>
            <p style={styles.emptyText}>
              {filter === "all" 
                ? "You haven't applied to any courses yet. Start exploring opportunities!"
                : `No ${filter} applications found in your records.`
              }
            </p>
            {filter !== "all" && (
              <button 
                style={styles.viewAllButton}
                onClick={() => setFilter("all")}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
              >
                View All Applications
              </button>
            )}
          </div>
        ) : (
          <div style={styles.admissionsGrid}>
            {filteredAdmissions.map((admission, index) => (
              <AdmissionCard key={admission.id || index} admission={admission} />
            ))}
          </div>
        )}
      </div>

      {/* Success Rate Section */}
      {stats.total > 0 && (
        <div style={styles.successSection}>
          <h3 style={styles.successTitle}>Application Success Rate</h3>
          <div style={styles.successStats}>
            <div style={styles.successStat}>
              <div style={styles.successValue}>
                {stats.approved > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </div>
              <div style={styles.successLabel}>Acceptance Rate</div>
            </div>
            <div style={styles.successStat}>
              <div style={styles.successValue}>{stats.pending}</div>
              <div style={styles.successLabel}>Under Review</div>
            </div>
            <div style={styles.successStat}>
              <div style={styles.successValue}>
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </div>
              <div style={styles.successLabel}>Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {admissions.length > 0 && (
        <div style={styles.helpSection}>
          <h3 style={styles.helpTitle}>Application Guidance</h3>
          <div style={styles.helpGrid}>
            <div style={styles.helpCard}>
              <h4 style={styles.helpCardTitle}>⏳ Pending Applications</h4>
              <p style={styles.helpCardText}>
                Institutions typically respond within 2-4 weeks. Check back regularly for updates and ensure your contact information is current.
              </p>
            </div>
            <div style={styles.helpCard}>
              <h4 style={styles.helpCardTitle}> Approved Applications</h4>
              <p style={styles.helpCardText}>
                Congratulations! You'll receive further instructions from the institution via email. Respond promptly to secure your spot.
              </p>
            </div>
            <div style={styles.helpCard}>
              <h4 style={styles.helpCardTitle}> Multiple Approvals</h4>
              <p style={styles.helpCardText}>
                If accepted to multiple programs, carefully compare your options and make your decision within the given timeframe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#f8f8f8",
    minHeight: "100vh",
  },
  header: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
  },
  headerContent: {
    marginBottom: "1.5rem",
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
    margin: "0 0 0.5rem 0",
    lineHeight: "1.5",
  },
  lastUpdated: {
    fontSize: "0.85rem",
    color: "#999",
    margin: "0",
    fontStyle: "italic",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
  },
  statCard: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #f0f0f0",
  },
  statCardActive: {
    backgroundColor: "#f8f8f8",
    borderColor: "#1a1a1a",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: "1",
  },
  statTitle: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "500",
    marginTop: "0.5rem",
  },
  controlSection: {
    marginBottom: "1.5rem",
  },
  controlGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  refreshButton: {
    padding: "0.75rem 1.5rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
  },
  resultsInfo: {
    color: "#666",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  admissionsList: {
    marginBottom: "2rem",
  },
  admissionsGrid: {
    display: "grid",
    gap: "1.5rem",
  },
  admissionCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  courseInfo: {
    flex: "1",
  },
  courseName: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: "1.3",
  },
  institutionName: {
    margin: "0 0 0.75rem 0",
    color: "#666",
    fontWeight: "500",
    fontSize: "1rem",
  },
  metaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  applicationId: {
    fontSize: "0.8rem",
    color: "#999",
    fontFamily: "monospace",
  },
  updateTime: {
    fontSize: "0.8rem",
    color: "#999",
    fontStyle: "italic",
  },
  statusBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    whiteSpace: "nowrap",
  },
  statusIcon: {
    fontSize: "1rem",
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid #f0f0f0",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: "0.9rem",
  },
  detailValue: {
    color: "#666",
    fontSize: "0.9rem",
  },
  personalStatement: {
    marginTop: "0.5rem",
    padding: "1rem",
    background: "#f8f8f8",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  statementText: {
    margin: "0.5rem 0 0 0",
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    fontStyle: "italic",
  },
  approvedMessage: {
    marginTop: "1rem",
    padding: "1rem",
    background: "#f0f8f0",
    color: "#2d5a2d",
    borderRadius: "6px",
    border: "1px solid #d0e8d0",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    fontWeight: "500",
  },
  rejectedMessage: {
    marginTop: "1rem",
    padding: "1rem",
    background: "#f8f8f8",
    color: "#666",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    fontWeight: "500",
  },
  pendingMessage: {
    marginTop: "1rem",
    padding: "1rem",
    background: "#f8f8f8",
    color: "#666",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  emptyText: {
    color: "#666",
    margin: "0 0 1.5rem 0",
    lineHeight: "1.5",
  },
  viewAllButton: {
    padding: "0.75rem 1.5rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  successSection: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
    textAlign: "center",
  },
  successTitle: {
    color: "#1a1a1a",
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: "0 0 1.5rem 0",
  },
  successStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "2rem",
    maxWidth: "500px",
    margin: "0 auto",
  },
  successStat: {
    textAlign: "center",
  },
  successValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
  },
  successLabel: {
    color: "#666",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  helpSection: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  helpTitle: {
    color: "#1a1a1a",
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: "0 0 1.5rem 0",
    textAlign: "center",
  },
  helpGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  helpCard: {
    padding: "1.5rem",
    background: "#f8f8f8",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  helpCardTitle: {
    color: "#1a1a1a",
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 0.75rem 0",
  },
  helpCardText: {
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    margin: "0",
  },
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
  errorContainer: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    margin: "2rem",
    border: "1px solid #e0e0e0",
  },
  errorIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  errorTitle: {
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
    fontSize: "1.5rem",
  },
  errorMessage: {
    color: "#8b2d2d",
    margin: "0 0 1.5rem 0",
    lineHeight: "1.5",
  },
  errorActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  retryButton: {
    padding: "0.75rem 1.5rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  debugText: {
    fontSize: "0.8rem",
    color: "#999",
    fontFamily: "monospace",
    margin: "1rem 0 0 0",
  },
};

export default ViewAdmissions;
