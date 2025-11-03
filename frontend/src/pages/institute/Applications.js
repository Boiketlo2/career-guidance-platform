// Update Applications.js with search and filter
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

const Applications = () => {
  const { institutionId } = useParams();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const applicationsSnapshot = await getDocs(collection(db, "applications"));
        const institutionApplications = applicationsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(app => app.institutionId === institutionId);

        setApplications(institutionApplications);
        setFilteredApplications(institutionApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [institutionId]);

  // Filter applications based on search and status
  useEffect(() => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.courseId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status,
        updatedAt: new Date()
      });

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));

      alert(`Application ${status} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update application status");
    }
  };

  // Simple navigation component
  const SimpleNav = () => (
    <div style={{
      background: "#f8f9fa",
      padding: "15px 20px",
      borderBottom: "2px solid #667eea",
      marginBottom: "20px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ margin: 0, color: "#333" }}>Institute Portal</h3>
        <div style={{ display: "flex", gap: "15px" }}>
          <Link to={`/institutes/${institutionId}/dashboard`}>Dashboard</Link>
          <Link to={`/institutes/${institutionId}/faculties`}>Faculties</Link>
          <Link to={`/institutes/${institutionId}/courses`}>Courses</Link>
          <Link to={`/institutes/${institutionId}/applications`}>Applications</Link>
          <Link to={`/institutes/${institutionId}/profile`}>Profile</Link>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px" }}>Loading applications...</div>
    </div>
  );

  const pendingApps = applications.filter(app => app.status === "pending");
  const approvedApps = applications.filter(app => app.status === "approved");
  const rejectedApps = applications.filter(app => app.status === "rejected");

  return (
    <div>
      <SimpleNav />
      <div style={{ padding: "20px" }}>
        <h1>Student Applications</h1>
        
        {/* Application Stats */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ background: "#ff6b6b", color: "white", padding: "10px 15px", borderRadius: "4px" }}>
            <strong>Pending:</strong> {pendingApps.length}
          </div>
          <div style={{ background: "#51cf66", color: "white", padding: "10px 15px", borderRadius: "4px" }}>
            <strong>Approved:</strong> {approvedApps.length}
          </div>
          <div style={{ background: "#868e96", color: "white", padding: "10px 15px", borderRadius: "4px" }}>
            <strong>Rejected:</strong> {rejectedApps.length}
          </div>
          <div style={{ background: "#667eea", color: "white", padding: "10px 15px", borderRadius: "4px" }}>
            <strong>Total:</strong> {applications.length}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "15px", 
          marginBottom: "20px",
          alignItems: "end"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
              Search Applications
            </label>
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px 12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px" 
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px 12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px" 
              }}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: "15px", color: "#666" }}>
          Showing {filteredApplications.length} of {applications.length} applications
        </div>

        {filteredApplications.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            background: "#f8f9fa", 
            borderRadius: "8px" 
          }}>
            <h3>No Applications Found</h3>
            <p>
              {applications.length === 0 
                ? "Student applications will appear here when they apply to your courses." 
                : "No applications match your search criteria."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {filteredApplications.map((app) => (
              <div key={app.id} style={{ 
                border: "1px solid #ddd", 
                padding: "20px", 
                borderRadius: "8px",
                backgroundColor: app.status === "pending" ? "#fff" : 
                               app.status === "approved" ? "#f0fff0" : "#fff0f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 style={{ margin: "0 0 10px 0" }}>{app.studentName}</h3>
                    <p style={{ margin: "5px 0" }}><strong>Email:</strong> {app.studentEmail}</p>
                    <p style={{ margin: "5px 0" }}><strong>Course:</strong> {app.courseId}</p>
                    <p style={{ margin: "5px 0" }}><strong>Applied:</strong> {app.appliedDate?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ 
                      padding: "5px 10px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      backgroundColor: app.status === "approved" ? "#d4edda" : 
                                     app.status === "rejected" ? "#f8d7da" : "#fff3cd",
                      color: app.status === "approved" ? "#155724" : 
                            app.status === "rejected" ? "#721c24" : "#856404"
                    }}>
                      {app.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {app.status === "pending" && (
                  <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                    <button 
                      onClick={() => handleUpdateStatus(app.id, "approved")}
                      style={{ 
                        backgroundColor: "#28a745", 
                        color: "white", 
                        padding: "8px 15px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      Approve Application
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(app.id, "rejected")}
                      style={{ 
                        backgroundColor: "#dc3545", 
                        color: "white",
                        padding: "8px 15px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;