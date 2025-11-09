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
        alert(`✅ Application ${newStatus} successfully!`);
      } else {
        alert("❌ Failed to update application status");
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("❌ Failed to update application status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>Loading applications...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Applications</h1>
          <p style={styles.subtitle}>Review and manage course applications from students</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
          <button onClick={fetchApplications} style={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{applications.length}</div>
          <div style={styles.statLabel}>Total Applications</div>
        </div>
        <div style={{...styles.statCard, ...styles.statPending}}>
          <div style={styles.statNumber}>{getStatusCount('pending')}</div>
          <div style={styles.statLabel}>Pending Review</div>
        </div>
        <div style={{...styles.statCard, ...styles.statApproved}}>
          <div style={styles.statNumber}>{getStatusCount('approved')}</div>
          <div style={styles.statLabel}>Approved</div>
        </div>
        <div style={{...styles.statCard, ...styles.statRejected}}>
          <div style={styles.statNumber}>{getStatusCount('rejected')}</div>
          <div style={styles.statLabel}>Rejected</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={styles.filterContainer}>
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
      </div>

      {/* Results Info */}
      <div style={styles.resultsInfo}>
        Showing {filteredApplications.length} of {applications.length} applications
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
        </div>
      ) : (
        <div style={styles.applicationsList}>
          {filteredApplications.map((application) => (
            <div key={application.id} style={styles.applicationCard}>
              {/* Application Header */}
              <div style={styles.applicationHeader}>
                <div style={styles.studentInfo}>
                  <h3 style={styles.studentName}>
                    {application.studentDetails?.name || 'Unknown Student'}
                  </h3>
                  <p style={styles.studentEmail}>
                    {application.studentDetails?.email || 'No email provided'}
                  </p>
                  <p style={styles.courseInfo}>
                    <strong>Course:</strong> {application.courseDetails?.name || 'Unknown Course'}
                  </p>
                </div>
                <div style={styles.applicationMeta}>
                  <span style={{
                    ...styles.statusBadge,
                    ...styles[`status${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`]
                  }}>
                    {application.status.toUpperCase()}
                  </span>
                  <div style={styles.applicationDates}>
                    <small style={styles.dateText}>
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </small>
                    {application.reviewedAt && (
                      <small style={styles.dateText}>
                        Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Statement */}
              {application.personalStatement && (
                <div style={styles.personalStatement}>
                  <strong style={styles.sectionTitle}>Personal Statement:</strong>
                  <p style={styles.statementText}>{application.personalStatement}</p>
                </div>
              )}

              {/* Action Buttons for Pending Applications */}
              {application.status === "pending" && (
                <div style={styles.applicationActions}>
                  <button
                    onClick={() => handleUpdateStatus(application.id, "approved")}
                    disabled={updatingStatus === application.id}
                    style={styles.approveButton}
                  >
                    {updatingStatus === application.id ? "🔄 Updating..." : "✅ Approve Application"}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(application.id, "rejected")}
                    disabled={updatingStatus === application.id}
                    style={styles.rejectButton}
                  >
                    {updatingStatus === application.id ? "🔄 Updating..." : "❌ Reject Application"}
                  </button>
                </div>
              )}

              {/* Review Notes for Processed Applications */}
              {application.status !== "pending" && application.notes && (
                <div style={styles.applicationNotes}>
                  <strong style={styles.sectionTitle}>Review Notes:</strong>
                  <p style={styles.notesText}>{application.notes}</p>
                </div>
              )}

              {/* Debug Info - Remove in production */}
              <div style={styles.debugInfo}>
                <small>Application ID: {application.id}</small>
                <small>Student ID: {application.studentId}</small>
                <small>Course ID: {application.courseId}</small>
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
    padding: '20px',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e9ecef'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 5px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  },

  // Error Message
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  retryButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },

  // Statistics
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  },
  statPending: {
    borderLeft: '4px solid #ffc107'
  },
  statApproved: {
    borderLeft: '4px solid #28a745'
  },
  statRejected: {
    borderLeft: '4px solid #dc3545'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },

  // Filter Controls
  filterContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: '1',
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  filterBox: {
    minWidth: '200px'
  },
  filterSelect: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: 'white'
  },

  // Results Info
  resultsInfo: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '20px'
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '10px'
  },
  emptyText: {
    color: '#666',
    fontSize: '16px',
    lineHeight: '1.5'
  },

  // Applications List
  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  // Application Card
  applicationCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },

  // Application Header
  applicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  studentInfo: {
    flex: '1',
    minWidth: '250px'
  },
  studentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 5px 0'
  },
  studentEmail: {
    color: '#666',
    margin: '0 0 10px 0',
    fontSize: '14px'
  },
  courseInfo: {
    color: '#333',
    margin: 0,
    fontSize: '14px'
  },

  // Application Meta
  applicationMeta: {
    textAlign: 'right',
    minWidth: '150px'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '10px'
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404'
  },
  statusApproved: {
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  statusRejected: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  applicationDates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  dateText: {
    color: '#666',
    fontSize: '12px'
  },

  // Personal Statement
  personalStatement: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #007bff'
  },
  sectionTitle: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px'
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
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  approveButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: '1',
    minWidth: '140px'
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: '1',
    minWidth: '140px'
  },

  // Application Notes
  applicationNotes: {
    padding: '15px',
    backgroundColor: '#e7f3ff',
    borderRadius: '6px',
    borderLeft: '4px solid #17a2b8'
  },
  notesText: {
    margin: 0,
    color: '#555',
    lineHeight: '1.5',
    fontSize: '14px'
  },

  // Debug Info
  debugInfo: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  // Loading States
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh'
  },
  loadingSpinner: {
    fontSize: '18px',
    color: '#666'
  }
};

// Add hover effects
styles.approveButton = {
  ...styles.approveButton,
  ':hover': {
    backgroundColor: '#218838'
  }
};

styles.rejectButton = {
  ...styles.rejectButton,
  ':hover': {
    backgroundColor: '#c82333'
  }
};

styles.applicationCard = {
  ...styles.applicationCard,
  ':hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)'
  }
};

export default ViewApplications;