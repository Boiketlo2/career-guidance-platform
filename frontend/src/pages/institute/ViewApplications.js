import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const ViewApplications = () => {
  const { institutionId } = useParams();
  
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [institutionId]);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      console.log("📥 Fetching applications for institution:", institutionId);
      const response = await instituteAPI.getApplications(institutionId);
      console.log("📋 Applications response:", response);
      
      if (response.success) {
        setApplications(response.applications || []);
      } else {
        setError(response.error || "Failed to load applications");
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.error || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.studentDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.courseDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      console.log("🔄 Updating application status:", { applicationId, newStatus });
      
      const response = await instituteAPI.updateApplicationStatus(applicationId, {
        status: newStatus,
        notes: `Application ${newStatus} by institution on ${new Date().toLocaleDateString()}`
      });

      console.log("✅ Update response:", response);

      if (response.success) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { 
            ...app, 
            status: newStatus,
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: `Application ${newStatus} by institution`
          } : app
        ));
      } else {
        setError("Failed to update application status");
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update application status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  const getStatusPercentage = (status) => {
    return applications.length > 0 ? ((getStatusCount(status) / applications.length) * 100).toFixed(1) : 0;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading Applications...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Student Applications</h1>
          <p style={styles.subtitle}>Review and manage course applications from students</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
          <button onClick={fetchApplications} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Enhanced Statistics Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statNumber}>{applications.length}</div>
          <div style={styles.statLabel}>Total Applications</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statNumber}>{getStatusCount('pending')}</div>
          <div style={styles.statLabel}>Pending Review</div>
          <div style={styles.statPercentage}>{getStatusPercentage('pending')}%</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statNumber}>{getStatusCount('approved')}</div>
          <div style={styles.statLabel}>Approved</div>
          <div style={styles.statPercentage}>{getStatusPercentage('approved')}%</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>❌</div>
          <div style={styles.statNumber}>{getStatusCount('rejected')}</div>
          <div style={styles.statLabel}>Rejected</div>
          <div style={styles.statPercentage}>{getStatusPercentage('rejected')}%</div>
        </div>
      </div>

      {/* Enhanced Filter Controls */}
      <div style={styles.filterSection}>
        <div style={styles.filterHeader}>
          <h3 style={styles.filterTitle}>Filter Applications</h3>
          <div style={styles.filterStats}>
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        </div>
        <div style={styles.filterControls}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterBox}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>
          <div style={styles.quickFilters}>
            <button 
              style={statusFilter === "all" ? styles.quickFilterActive : styles.quickFilter}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button 
              style={statusFilter === "pending" ? styles.quickFilterActive : styles.quickFilter}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </button>
            <button 
              style={statusFilter === "approved" ? styles.quickFilterActive : styles.quickFilter}
              onClick={() => setStatusFilter("approved")}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📝</div>
          <h3 style={styles.emptyTitle}>No Applications Found</h3>
          <p style={styles.emptyText}>
            {applications.length === 0 
              ? "Student applications will appear here when they apply to your courses." 
              : "No applications match your search criteria."}
          </p>
          <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} style={styles.clearFiltersButton}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={styles.applicationsGrid}>
          {filteredApplications.map((application) => (
            <div key={application.id} style={styles.applicationCard}>
              {/* Application Header */}
              <div style={styles.applicationHeader}>
                <div style={styles.studentInfo}>
                  <div style={styles.studentAvatar}>
                    {application.studentDetails?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 style={styles.studentName}>
                      {application.studentDetails?.name || 'Unknown Student'}
                    </h3>
                    <p style={styles.studentEmail}>
                      {application.studentDetails?.email || 'No email provided'}
                    </p>
                  </div>
                </div>
                <div style={styles.applicationMeta}>
                  <span style={{
                    ...styles.statusBadge,
                    ...styles[`status${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`]
                  }}>
                    {application.status.toUpperCase()}
                  </span>
                  <div style={styles.applicationDates}>
                    <div style={styles.dateText}>
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                    {application.reviewedAt && (
                      <div style={styles.dateText}>
                        Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div style={styles.courseSection}>
                <strong style={styles.sectionLabel}>Course Applied:</strong>
                <div style={styles.courseName}>{application.courseDetails?.name || 'Unknown Course'}</div>
                {application.courseDetails?.faculty && (
                  <div style={styles.facultyName}>{application.courseDetails.faculty}</div>
                )}
              </div>

              {/* Personal Statement */}
              {application.personalStatement && (
                <div style={styles.personalStatement}>
                  <strong style={styles.sectionLabel}>Personal Statement:</strong>
                  <p style={styles.statementText}>{application.personalStatement}</p>
                </div>
              )}

              {/* Action Buttons for Pending Applications */}
              {application.status === "pending" && (
                <div style={styles.applicationActions}>
                  <button
                    onClick={() => handleUpdateStatus(application.id, "approved")}
                    disabled={updatingStatus === application.id}
                    style={updatingStatus === application.id ? styles.approveButtonDisabled : styles.approveButton}
                  >
                    {updatingStatus === application.id ? (
                      <div style={styles.buttonContent}>
                        <div style={styles.smallSpinner}></div>
                        Processing...
                      </div>
                    ) : (
                      "✅ Approve Application"
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(application.id, "rejected")}
                    disabled={updatingStatus === application.id}
                    style={updatingStatus === application.id ? styles.rejectButtonDisabled : styles.rejectButton}
                  >
                    {updatingStatus === application.id ? (
                      <div style={styles.buttonContent}>
                        <div style={styles.smallSpinner}></div>
                        Processing...
                      </div>
                    ) : (
                      "❌ Reject Application"
                    )}
                  </button>
                </div>
              )}

              {/* Review Notes for Processed Applications */}
              {application.status !== "pending" && application.notes && (
                <div style={styles.applicationNotes}>
                  <strong style={styles.sectionLabel}>Review Notes:</strong>
                  <p style={styles.notesText}>{application.notes}</p>
                </div>
              )}

              {/* Application Meta Footer */}
              <div style={styles.applicationFooter}>
                <div style={styles.applicationId}>
                  Application ID: {application.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px 40px 20px',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#fafbfc',
    minHeight: '100vh'
  },
  
  // Header
  header: {
    background: '#ffffff',
    padding: '30px',
    marginBottom: 24,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9'
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
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

  // Error Message
  error: {
    background: '#fef2f2',
    padding: '20px',
    borderRadius: 8,
    color: '#dc2626',
    marginBottom: 24,
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: 12
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
    marginBottom: 4,
    fontSize: '14px'
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
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  // Enhanced Statistics
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#ffffff',
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
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    marginBottom: '4px'
  },
  statPercentage: {
    fontSize: '12px',
    color: '#8c8c8c',
    fontWeight: '500'
  },

  // Enhanced Filter Section
  filterSection: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: 8,
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9'
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  filterTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0
  },
  filterStats: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  filterControls: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: '1',
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#1a1a1a'
  },
  filterBox: {
    minWidth: '200px'
  },
  filterSelect: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    color: '#1a1a1a'
  },
  quickFilters: {
    display: 'flex',
    gap: '8px'
  },
  quickFilter: {
    background: 'transparent',
    color: '#333',
    border: '1px solid #d0d7de',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  quickFilterActive: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: '1px solid #1a1a1a',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '60px 40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px'
  },
  emptyText: {
    color: '#666',
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '24px'
  },
  clearFiltersButton: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  // Applications Grid
  applicationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: '24px'
  },

  // Application Card
  applicationCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9',
    transition: 'all 0.2s ease'
  },

  // Application Header
  applicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    gap: '15px'
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1
  },
  studentAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#1a1a1a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0
  },
  studentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px 0'
  },
  studentEmail: {
    color: '#666',
    margin: 0,
    fontSize: '14px'
  },

  // Application Meta
  applicationMeta: {
    textAlign: 'right',
    minWidth: '120px'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '8px'
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeaa7'
  },
  statusApproved: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  statusRejected: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  applicationDates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  dateText: {
    color: '#666',
    fontSize: '11px'
  },

  // Course Section
  courseSection: {
    marginBottom: '16px',
    padding: '12px 0',
    borderTop: '1px solid #f0f0f0'
  },
  sectionLabel: {
    display: 'block',
    marginBottom: '4px',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500'
  },
  courseName: {
    color: '#1a1a1a',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '2px'
  },
  facultyName: {
    color: '#666',
    fontSize: '13px'
  },

  // Personal Statement
  personalStatement: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #1a1a1a'
  },
  statementText: {
    margin: 0,
    color: '#555',
    lineHeight: '1.5',
    fontSize: '14px'
  },

  // Application Actions
  applicationActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  approveButton: {
    backgroundColor: '#0f7a0f',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: '1',
    transition: 'all 0.2s ease'
  },
  approveButtonDisabled: {
    backgroundColor: '#8c8c8c',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '14px',
    flex: '1'
  },
  rejectButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: '1',
    transition: 'all 0.2s ease'
  },
  rejectButtonDisabled: {
    backgroundColor: '#8c8c8c',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '14px',
    flex: '1'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8'
  },
  smallSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Application Notes
  applicationNotes: {
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '6px',
    borderLeft: '4px solid #0369a1'
  },
  notesText: {
    margin: 0,
    color: '#555',
    lineHeight: '1.5',
    fontSize: '14px'
  },

  // Application Footer
  applicationFooter: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0'
  },
  applicationId: {
    color: '#8c8c8c',
    fontSize: '11px',
    fontWeight: '500'
  },

  // Loading States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
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

export default ViewApplications;
