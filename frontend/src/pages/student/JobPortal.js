import React, { useEffect, useState } from "react";
import { studentAPI } from "../../api/studentAPI";
import { useAuth } from "../../context/AuthContext";

const JobPortal = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (user?.uid) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const res = await studentAPI.getAllJobs();
      if (res.success) {
        setJobs(res.jobs);
        // Extract applied jobs from each job's applicants array
        const applied = new Set();
        res.jobs.forEach(job => {
          if (job.applicants?.includes(user.uid)) {
            applied.add(job.id);
          }
        });
        setAppliedJobs(applied);
      } else {
        setMessage("Failed to load available jobs.");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setMessage("Error fetching jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId, companyId) => {
    try {
      console.log("Applying for job:", { jobId, companyId, studentId: user.uid });
      
      const res = await studentAPI.applyForJob({
        studentId: user.uid,
        jobId: jobId,
        companyId: companyId
      });
      
      if (res.success) {
        setMessage("Application submitted successfully!");
        setAppliedJobs(prev => new Set([...prev, jobId]));
        setTimeout(() => setMessage(""), 3000);
        
        // Refresh jobs to get updated applicant lists
        fetchJobs();
      } else {
        setMessage(res.error || "Failed to apply for this job.");
      }
    } catch (err) {
      console.error("Error applying for job:", err);
      setMessage("Error applying for job. Please try again.");
    }
  };

  const getSortedAndFilteredJobs = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.companyIndustry?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === "all" || 
                           (filter === "applied" && appliedJobs.has(job.id)) ||
                           (filter === "available" && !appliedJobs.has(job.id));
      return matchesSearch && matchesFilter;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "company":
          return (a.companyName || "").localeCompare(b.companyName || "");
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredJobs = getSortedAndFilteredJobs();

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return '#2d5a2d';
      case 'part-time': return '#666';
      case 'internship': return '#1a1a1a';
      case 'contract': return '#444';
      default: return '#666';
    }
  };

  const getApplicationStats = () => {
    const total = jobs.length;
    const applied = appliedJobs.size;
    const available = total - applied;
    return { total, applied, available };
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading available jobs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Job Portal</h1>
          <p style={styles.subtitle}>Discover career opportunities that match your profile and aspirations</p>
        </div>
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.total}</span>
            <span style={styles.statLabel}>Total Jobs</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.applied}</span>
            <span style={styles.statLabel}>Applied</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.available}</span>
            <span style={styles.statLabel}>Available</span>
          </div>
        </div>
      </div>

      {message && (
        <div style={message.includes("success") ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}

      {/* Enhanced Controls Section */}
      <div style={styles.controls}>
        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search jobs, companies, or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
        </div>
        
        <div style={styles.controlGroup}>
          <div style={styles.filterGroup}>
            <button
              style={{...styles.filterButton, ...(filter === "all" ? styles.filterActive : {})}}
              onClick={() => setFilter("all")}
            >
              All Jobs
            </button>
            <button
              style={{...styles.filterButton, ...(filter === "available" ? styles.filterActive : {})}}
              onClick={() => setFilter("available")}
            >
              Available
            </button>
            <button
              style={{...styles.filterButton, ...(filter === "applied" ? styles.filterActive : {})}}
              onClick={() => setFilter("applied")}
            >
              Applied ({appliedJobs.size})
            </button>
          </div>

          <div style={styles.sortGroup}>
            <label style={styles.sortLabel}>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="company">Company Name</option>
              <option value="title">Job Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Application Progress */}
      {appliedJobs.size > 0 && (
        <div style={styles.progressSection}>
          <h3 style={styles.progressTitle}>Your Job Search Progress</h3>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${(appliedJobs.size / Math.max(jobs.length, 1)) * 100}%`
              }}
            />
          </div>
          <p style={styles.progressText}>
            You've applied to {appliedJobs.size} out of {jobs.length} jobs ({Math.round((appliedJobs.size / Math.max(jobs.length, 1)) * 100)}%)
          </p>
        </div>
      )}

      {filteredJobs.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>No jobs found</h3>
          <p style={styles.emptyText}>No jobs match your current search criteria.</p>
          <button 
            style={styles.clearFiltersButton}
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div style={styles.resultsInfo}>
            <p style={styles.resultsText}>
              Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} 
              {searchTerm && ` for "${searchTerm}"`}
              {filter !== 'all' && ` (${filter})`}
            </p>
          </div>
          
          <div style={styles.jobGrid}>
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                style={styles.jobCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.jobHeader}>
                  <div style={styles.jobInfo}>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <p style={styles.companyName}>{job.companyName}</p>
                    <div style={styles.companyBadge}>
                      <span style={styles.industryTag}>{job.companyIndustry}</span>
                      {job.companyStatus === "Approved" && (
                        <span style={styles.verifiedBadge}>✓ Verified Company</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.jobMeta}>
                    <span style={{...styles.jobType, backgroundColor: getJobTypeColor(job.type) + '1A', color: getJobTypeColor(job.type)}}>
                      {job.type || "Full-time"}
                    </span>
                    {job.createdAt && (
                      <span style={styles.postedDate}>
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.jobDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailItem}>
                      <strong>Industry:</strong> {job.companyIndustry}
                    </span>
                    <span style={styles.detailItem}>
                      <strong>Location:</strong> {job.location || "Lesotho"}
                    </span>
                  </div>
                  
                  {job.description && (
                    <div style={styles.description}>
                      <p style={styles.descriptionText}>{job.description}</p>
                    </div>
                  )}
                  
                  {job.requirements && job.requirements.length > 0 && (
                    <div style={styles.requirements}>
                      <strong style={styles.requirementsTitle}>Requirements:</strong>
                      <ul style={styles.requirementsList}>
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} style={styles.requirementItem}>{req}</li>
                        ))}
                        {job.requirements.length > 3 && (
                          <li style={styles.moreRequirements}>+{job.requirements.length - 3} more requirements</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={styles.jobFooter}>
                  <div style={styles.companyInfo}>
                    {job.companyWebsite && (
                      <a 
                        href={job.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.websiteLink}
                      >
                        Visit Company Website
                      </a>
                    )}
                  </div>
                  <button
                    style={{
                      ...styles.applyButton,
                      ...(appliedJobs.has(job.id) ? styles.appliedButton : {})
                    }}
                    disabled={appliedJobs.has(job.id)}
                    onClick={() => handleApply(job.id, job.companyId)}
                    onMouseEnter={(e) => {
                      if (!appliedJobs.has(job.id)) {
                        e.target.style.backgroundColor = '#333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!appliedJobs.has(job.id)) {
                        e.target.style.backgroundColor = '#1a1a1a';
                      }
                    }}
                  >
                    {appliedJobs.has(job.id) ? (
                      <>
                        <span style={styles.checkIcon}>✓</span>
                        Applied Successfully
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Job Search Tips */}
      <div style={styles.tipsSection}>
        <h3 style={styles.tipsTitle}>Job Search Tips</h3>
        <div style={styles.tipsGrid}>
          <div style={styles.tipCard}>
            <h4 style={styles.tipHeading}>Tailor Your Applications</h4>
            <p style={styles.tipText}>Customize your personal statement for each job application to stand out.</p>
          </div>
          <div style={styles.tipCard}>
            <h4 style={styles.tipHeading}>Research Companies</h4>
            <p style={styles.tipText}>Learn about companies before applying to show genuine interest.</p>
          </div>
          <div style={styles.tipCard}>
            <h4 style={styles.tipHeading}>Follow Up</h4>
            <p style={styles.tipText}>Consider following up on applications after 1-2 weeks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
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
    margin: "0",
    lineHeight: "1.5",
  },
  stats: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  statCard: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    textAlign: "center",
    border: "1px solid #e0e0e0",
    minWidth: "120px",
    flex: "1",
  },
  statNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "500",
  },
  controls: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
  },
  searchContainer: {
    marginBottom: "1rem",
  },
  searchBox: {
    position: "relative",
  },
  searchInput: {
    width: "100%",
    padding: "1rem 1.25rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.2s ease",
    background: "#fff",
  },
  controlGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  filterGroup: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "0.75rem 1.25rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
  },
  filterActive: {
    background: "#1a1a1a",
    color: "#fff",
    borderColor: "#1a1a1a",
  },
  sortGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  sortLabel: {
    color: "#666",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  sortSelect: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    fontSize: "0.9rem",
    outline: "none",
  },
  progressSection: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
  },
  progressTitle: {
    margin: "0 0 1rem 0",
    color: "#1a1a1a",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "0.5rem",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1a1a1a",
    transition: "width 0.3s ease",
  },
  progressText: {
    margin: "0",
    color: "#666",
    fontSize: "0.9rem",
  },
  resultsInfo: {
    marginBottom: "1rem",
  },
  resultsText: {
    color: "#666",
    fontSize: "0.9rem",
    margin: "0",
  },
  jobGrid: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    marginBottom: "3rem",
  },
  jobCard: {
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
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  jobInfo: {
    flex: "1",
  },
  jobTitle: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: "1.3",
  },
  companyName: {
    margin: "0 0 0.75rem 0",
    color: "#666",
    fontWeight: "500",
    fontSize: "1rem",
  },
  companyBadge: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  industryTag: {
    background: "#f0f0f0",
    color: "#666",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  verifiedBadge: {
    background: "#2d5a2d",
    color: "#fff",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  jobMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.5rem",
  },
  jobType: {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  postedDate: {
    fontSize: "0.75rem",
    color: "#999",
  },
  jobDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1rem",
    flex: "1",
  },
  detailRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  detailItem: {
    color: "#666",
    fontSize: "0.9rem",
  },
  description: {
    marginTop: "0.5rem",
  },
  descriptionText: {
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    margin: "0",
  },
  requirements: {
    marginTop: "0.75rem",
  },
  requirementsTitle: {
    color: "#1a1a1a",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
    display: "block",
  },
  requirementsList: {
    margin: "0",
    paddingLeft: "1.25rem",
  },
  requirementItem: {
    color: "#666",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
    lineHeight: "1.4",
  },
  moreRequirements: {
    color: "#999",
    fontSize: "0.8rem",
    fontStyle: "italic",
  },
  jobFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "1rem",
    borderTop: "1px solid #f0f0f0",
  },
  companyInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  websiteLink: {
    color: "#1a1a1a",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    borderBottom: "1px solid transparent",
    transition: "border-color 0.2s ease",
  },
  applyButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
  },
  appliedButton: {
    background: "#666",
    cursor: "not-allowed",
  },
  checkIcon: {
    fontSize: "1rem",
  },
  successMessage: {
    background: "#f0f8f0",
    color: "#2d5a2d",
    padding: "1rem 1.25rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #d0e8d0",
    fontSize: "0.9rem",
    textAlign: "center",
  },
  errorMessage: {
    background: "#f8f0f0",
    color: "#8b2d2d",
    padding: "1rem 1.25rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #e8d0d0",
    fontSize: "0.9rem",
    textAlign: "center",
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
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  emptyTitle: {
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
    fontSize: "1.25rem",
  },
  emptyText: {
    color: "#666",
    margin: "0 0 1.5rem 0",
  },
  clearFiltersButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  tipsSection: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  tipsTitle: {
    color: "#1a1a1a",
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: "0 0 1.5rem 0",
    textAlign: "center",
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  tipCard: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  tipHeading: {
    color: "#1a1a1a",
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 0.75rem 0",
  },
  tipText: {
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    margin: "0",
  },
};

export default JobPortal;
