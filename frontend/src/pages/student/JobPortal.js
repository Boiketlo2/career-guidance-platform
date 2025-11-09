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
        companyId: companyId  // Added companyId
      });
      
      if (res.success) {
        setMessage("🎉 Application submitted successfully!");
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyIndustry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || 
                         (filter === "applied" && appliedJobs.has(job.id)) ||
                         (filter === "available" && !appliedJobs.has(job.id));
    return matchesSearch && matchesFilter;
  });

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return '#10b981';
      case 'part-time': return '#f59e0b';
      case 'internship': return '#3b82f6';
      case 'contract': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading available jobs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Job Portal</h1>
          <p style={styles.subtitle}>Discover career opportunities that match your profile</p>
        </div>
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{jobs.length}</span>
            <span style={styles.statLabel}>Total Jobs</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{appliedJobs.size}</span>
            <span style={styles.statLabel}>Applied</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{jobs.filter(job => job.companyStatus === "Approved").length}</span>
            <span style={styles.statLabel}>Verified Companies</span>
          </div>
        </div>
      </div>

      {message && (
        <div style={message.includes("success") ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search jobs, companies, or industries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.searchIcon}>🔍</span>
        </div>
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
            Applied
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💼</div>
          <h3>No jobs found</h3>
          <p>No jobs match your current search criteria.</p>
          <button 
            style={styles.clearFiltersButton}
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={styles.jobGrid}>
          {filteredJobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <div>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.companyName}>{job.companyName}</p>
                  <div style={styles.companyBadge}>
                    <span style={styles.industryTag}>{job.companyIndustry}</span>
                    {job.companyStatus === "Approved" && (
                      <span style={styles.verifiedBadge}>✓ Verified</span>
                    )}
                  </div>
                </div>
                <div style={styles.jobMeta}>
                  <span style={{...styles.jobType, backgroundColor: getJobTypeColor(job.type)}}>
                    {job.type || "Full-time"}
                  </span>
                </div>
              </div>

              <div style={styles.jobDetails}>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>🏢</span>
                  <span>{job.companyIndustry}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>📍</span>
                  <span>{job.location || "Lesotho"}</span>
                </div>
                {job.requirements && job.requirements.length > 0 && (
                  <div style={styles.requirements}>
                    <strong>Requirements:</strong>
                    <ul style={styles.requirementsList}>
                      {job.requirements.map((req, index) => (
                        <li key={index} style={styles.requirementItem}>{req}</li>
                      ))}
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
                      Visit Website
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
                >
                  {appliedJobs.has(job.id) ? (
                    <>
                      <span style={styles.checkIcon}>✓</span>
                      Applied
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
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
    margin: "0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: "5px 0 0 0",
  },
  stats: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  statCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    minWidth: "100px",
  },
  statNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "500",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  },
  searchBox: {
    position: "relative",
    flex: "1",
    minWidth: "300px",
  },
  searchInput: {
    width: "100%",
    padding: "14px 45px 14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s ease",
    background: "#fff",
  },
  searchIcon: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    color: "#64748b",
  },
  filterGroup: {
    display: "flex",
    gap: "10px",
  },
  filterButton: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  filterActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    borderColor: "transparent",
  },
  jobGrid: {
    display: "grid",
    gap: "25px",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
  },
  jobCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  jobTitle: {
    margin: "0 0 5px 0",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  companyName: {
    margin: "0 0 8px 0",
    color: "#64748b",
    fontWeight: "500",
  },
  companyBadge: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  industryTag: {
    background: "#e2e8f0",
    color: "#475569",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  verifiedBadge: {
    background: "#10b981",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  jobMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "5px",
  },
  jobType: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#fff",
  },
  jobDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "15px",
    flex: "1",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  detailIcon: {
    fontSize: "14px",
  },
  requirements: {
    marginTop: "10px",
  },
  requirementsList: {
    margin: "5px 0 0 0",
    paddingLeft: "20px",
  },
  requirementItem: {
    color: "#475569",
    fontSize: "0.9rem",
    marginBottom: "4px",
  },
  jobFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  companyInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  websiteLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  applyButton: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  appliedButton: {
    background: "#6b7280",
    cursor: "not-allowed",
  },
  checkIcon: {
    fontSize: "16px",
  },
  successMessage: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    textAlign: "center",
    fontWeight: "500",
  },
  errorMessage: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    textAlign: "center",
    fontWeight: "500",
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
    marginBottom: "20px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  clearFiltersButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    cursor: "pointer",
    marginTop: "15px",
  },
};

export default JobPortal;