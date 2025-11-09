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

  useEffect(() => {
    fetchAdmissions();
  }, [studentId]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log("🔄 [ViewAdmissions] Starting to fetch admission results for student:", studentId);
      
      const res = await studentAPI.getAdmissionResults(studentId);
      console.log("📨 [ViewAdmissions] RAW API Response:", res);
      
      if (res?.success) {
        const admissionsData = res.results || [];
        console.log("✅ [ViewAdmissions] Processed admissions data:", admissionsData);
        
        setAdmissions(admissionsData);
        
        // Calculate stats
        const statsData = {
          total: admissionsData.length,
          approved: admissionsData.filter(app => app.status === "approved").length,
          pending: admissionsData.filter(app => app.status === "pending").length,
          rejected: admissionsData.filter(app => app.status === "rejected").length
        };
        
        setStats(statsData);
        console.log("📊 [ViewAdmissions] Calculated stats:", statsData);
        
        // Set debug info
        setDebugInfo({
          apiResponse: res,
          processedData: admissionsData,
          stats: statsData,
          timestamp: new Date().toISOString()
        });
        
      } else {
        console.error("❌ [ViewAdmissions] API returned success: false", res?.error);
        setError(res?.error || "Failed to fetch admissions");
      }
    } catch (err) {
      console.error("💥 [ViewAdmissions] Error fetching admissions:", err);
      setError(err.message || "Failed to load admission results");
    } finally {
      setLoading(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      console.log("🔍 [ViewAdmissions] Fetching debug info...");
      // Using the debug endpoint we added
      const response = await fetch(`http://localhost:5000/api/student/debug/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log("🐛 [ViewAdmissions] Debug info:", data);
      setDebugInfo(prev => ({ ...prev, debugEndpoint: data }));
    } catch (err) {
      console.error("💥 [ViewAdmissions] Error fetching debug info:", err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': 
        return { 
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          icon: "✅"
        };
      case 'rejected': 
        return { 
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          color: "#fff",
          icon: "❌"
        };
      default: 
        return { 
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#fff",
          icon: "⏳"
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

  const AdmissionCard = ({ admission }) => {
    const statusStyle = getStatusStyle(admission.status);
    
    return (
      <div style={styles.admissionCard}>
        <div style={styles.cardHeader}>
          <div style={styles.courseInfo}>
            <h3 style={styles.courseName}>{admission.courseName || "Unknown Course"}</h3>
            <p style={styles.institutionName}>{admission.institutionName || "Unknown Institution"}</p>
            <p style={styles.applicationId}>Application ID: {admission.id}</p>
            <p style={styles.applicationId}>Course ID: {admission.courseId} | Institution ID: {admission.institutionId}</p>
          </div>
          <div style={{
            ...styles.statusBadge,
            background: statusStyle.background,
            color: statusStyle.color
          }}>
            <span style={styles.statusIcon}>{statusStyle.icon}</span>
            {admission.status ? admission.status.charAt(0).toUpperCase() + admission.status.slice(1) : "Unknown"}
          </div>
        </div>
        
        <div style={styles.cardDetails}>
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
          {admission.personalStatement && (
            <div style={styles.personalStatement}>
              <span style={styles.detailLabel}>Personal Statement:</span>
              <p style={styles.statementText}>{admission.personalStatement}</p>
            </div>
          )}
        </div>

        {admission.status === "approved" && (
          <div style={styles.approvedMessage}>
            <span style={styles.approvedIcon}>🎉</span>
            Congratulations! You've been accepted into this program.
          </div>
        )}

        {admission.status === "rejected" && (
          <div style={styles.rejectedMessage}>
            <span style={styles.rejectedIcon}>💡</span>
            Don't worry! Explore other opportunities that match your profile.
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, color, onClick }) => (
    <div 
      style={{...styles.statCard, borderLeft: `4px solid ${color}`}}
      onClick={onClick}
    >
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading admission results...</p>
        <p style={styles.debugText}>Student ID: {studentId}</p>
        <button 
          style={styles.debugButton}
          onClick={fetchDebugInfo}
        >
          🐛 Fetch Debug Info
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3>Error Loading Admissions</h3>
        <p>{error}</p>
        <button 
          style={styles.retryButton}
          onClick={fetchAdmissions}
        >
          Try Again
        </button>
        <button 
          style={styles.debugButton}
          onClick={fetchDebugInfo}
        >
          🐛 Fetch Debug Info
        </button>
        <p style={styles.debugText}>Student ID: {studentId}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admission Results</h1>
          <p style={styles.subtitle}>Track your course application status and decisions</p>
          <p style={styles.debugText}>Student ID: {studentId} | Total Applications: {stats.total}</p>
        </div>
        <div style={styles.stats}>
          <StatCard 
            title="Total Applications" 
            value={stats.total} 
            color="#3b82f6"
            onClick={() => setFilter("all")}
          />
          <StatCard 
            title="Approved" 
            value={stats.approved} 
            color="#10b981"
            onClick={() => setFilter("approved")}
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            color="#f59e0b"
            onClick={() => setFilter("pending")}
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected} 
            color="#ef4444"
            onClick={() => setFilter("rejected")}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div style={styles.controlSection}>
        <button 
          style={styles.refreshButton}
          onClick={fetchAdmissions}
        >
          🔄 Refresh Results
        </button>
        <button 
          style={styles.debugButton}
          onClick={fetchDebugInfo}
        >
          🐛 Debug Info
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === "all" ? styles.filterTabActive : {})
          }}
          onClick={() => setFilter("all")}
        >
          All Applications ({stats.total})
        </button>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === "approved" ? styles.filterTabActive : {})
          }}
          onClick={() => setFilter("approved")}
        >
          Approved ({stats.approved})
        </button>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === "pending" ? styles.filterTabActive : {})
          }}
          onClick={() => setFilter("pending")}
        >
          Pending ({stats.pending})
        </button>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === "rejected" ? styles.filterTabActive : {})
          }}
          onClick={() => setFilter("rejected")}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Admissions List */}
      <div style={styles.admissionsList}>
        {getFilteredAdmissions().length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              {filter === "all" ? "📝" : 
               filter === "approved" ? "✅" :
               filter === "pending" ? "⏳" : "❌"}
            </div>
            <h3>
              {filter === "all" ? "No Applications Yet" :
               filter === "approved" ? "No Approved Applications" :
               filter === "pending" ? "No Pending Applications" : "No Rejected Applications"}
            </h3>
            <p>
              {filter === "all" 
                ? "You haven't applied to any courses yet. Start exploring opportunities!"
                : `No ${filter} applications found in your records.`
              }
            </p>
            {filter !== "all" && (
              <button 
                style={styles.viewAllButton}
                onClick={() => setFilter("all")}
              >
                View All Applications
              </button>
            )}
          </div>
        ) : (
          <div style={styles.admissionsGrid}>
            {getFilteredAdmissions().map((admission, index) => (
              <AdmissionCard key={admission.id || index} admission={admission} />
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div style={styles.debugSection}>
        <details>
          <summary>Debug Information ({admissions.length} applications found)</summary>
          <div style={styles.debugControls}>
            <button 
              style={styles.smallButton}
              onClick={() => console.log("Debug Info:", debugInfo)}
            >
              Log to Console
            </button>
            <button 
              style={styles.smallButton}
              onClick={fetchDebugInfo}
            >
              Refresh Debug
            </button>
          </div>
          <pre style={styles.debugPre}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>

      {/* Help Section */}
      {admissions.length > 0 && (
        <div style={styles.helpSection}>
          <h3 style={styles.helpTitle}>💡 Need Help?</h3>
          <div style={styles.helpGrid}>
            <div style={styles.helpCard}>
              <h4>Pending Applications</h4>
              <p>Institutions typically respond within 2-4 weeks. Check back regularly for updates.</p>
            </div>
            <div style={styles.helpCard}>
              <h4>Approved Applications</h4>
              <p>Congratulations! You'll receive further instructions from the institution via email.</p>
            </div>
            <div style={styles.helpCard}>
              <h4>Multiple Approvals</h4>
              <p>If accepted to multiple programs, you'll need to choose one institution.</p>
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
    padding: "20px",
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
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: "0",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    minWidth: "300px",
  },
  statCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
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
  controlSection: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    justifyContent: "center",
  },
  refreshButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  debugButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  smallButton: {
    padding: "5px 10px",
    background: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "10px",
  },
  filterTabs: {
    display: "flex",
    background: "#fff",
    borderRadius: "12px",
    padding: "5px",
    marginBottom: "30px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    flexWrap: "wrap",
  },
  filterTab: {
    flex: "1",
    padding: "12px 20px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "500",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    fontSize: "14px",
    minWidth: "120px",
  },
  filterTabActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  admissionsList: {
    marginBottom: "40px",
  },
  admissionsGrid: {
    display: "grid",
    gap: "20px",
  },
  admissionCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f1f5f9",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  courseInfo: {
    flex: "1",
  },
  courseName: {
    margin: "0 0 5px 0",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  institutionName: {
    margin: "0 0 5px 0",
    color: "#64748b",
    fontWeight: "500",
  },
  applicationId: {
    fontSize: "10px",
    color: "#9ca3af",
    margin: "2px 0 0 0",
    fontFamily: "monospace",
  },
  statusBadge: {
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
  },
  statusIcon: {
    fontSize: "16px",
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  },
  detailValue: {
    color: "#6b7280",
    fontSize: "14px",
  },
  personalStatement: {
    marginTop: "10px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  statementText: {
    margin: "8px 0 0 0",
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.5",
    fontStyle: "italic",
  },
  approvedMessage: {
    marginTop: "15px",
    padding: "12px 16px",
    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    color: "#065f46",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
  },
  rejectedMessage: {
    marginTop: "15px",
    padding: "12px 16px",
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    color: "#92400e",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
  },
  approvedIcon: {
    fontSize: "18px",
  },
  rejectedIcon: {
    fontSize: "18px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  viewAllButton: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  debugText: {
    fontSize: "12px",
    color: "#6b7280",
    fontFamily: "monospace",
    margin: "5px 0 0 0",
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    margin: "20px",
  },
  errorIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  retryButton: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    marginRight: "10px",
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
  debugSection: {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "8px",
    marginTop: "20px",
    border: "1px solid #e2e8f0",
  },
  debugControls: {
    marginBottom: "10px",
  },
  debugPre: {
    fontSize: "12px",
    background: "#1f2937",
    color: "#f3f4f6",
    padding: "15px",
    borderRadius: "6px",
    overflow: "auto",
    maxHeight: "300px",
  },
  helpSection: {
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  helpTitle: {
    margin: "0 0 20px 0",
    color: "#1e293b",
    fontSize: "1.2rem",
  },
  helpGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  helpCard: {
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
};

export default ViewAdmissions;