import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const ManageFaculties = () => {
  const { institutionId } = useParams();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFaculties();
  }, [institutionId]);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const res = await instituteAPI.getFaculties(institutionId);
      console.log("📋 Faculties response:", res);
      
      if (res.success) {
        setFaculties(res.faculties || []);
      } else {
        setError(res.error || "Failed to load faculties");
      }
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError(err.response?.data?.error || "Failed to load faculties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;

    try {
      const res = await instituteAPI.deleteFaculty(institutionId, facultyId);
      if (res.success) {
        alert("Faculty deleted successfully!");
        fetchFaculties();
      } else {
        alert("Failed to delete faculty");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting faculty");
    }
  };

  if (loading) return <div style={styles.loading}>Loading Faculties...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Manage Faculties</h1>
        <Link to={`/institute/${institutionId}/faculties/add`} style={styles.addBtn}>
          + Add New Faculty
        </Link>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={fetchFaculties} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {faculties.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No faculties found.</p>
          <Link to={`/institute/${institutionId}/faculties/add`} style={styles.addBtn}>
            + Add Your First Faculty
          </Link>
        </div>
      ) : (
        <div style={styles.facultiesGrid}>
          {faculties.map((faculty) => (
            <div key={faculty.id} style={styles.facultyCard}>
              <h3>{faculty.name}</h3>
              <p style={styles.description}>{faculty.description || "No description provided"}</p>
              <div style={styles.facultyMeta}>
                <small>Created: {new Date(faculty.createdAt).toLocaleDateString()}</small>
                <small>Courses: {faculty.courses?.length || 0}</small>
              </div>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(faculty.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: 1200, 
    margin: "40px auto", 
    padding: 20, 
    fontFamily: "Inter, sans-serif" 
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  facultiesGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: 20, 
    marginTop: 20 
  },
  facultyCard: { 
    background: "#fff", 
    padding: 20, 
    borderRadius: 10, 
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef"
  },
  description: {
    color: "#666",
    margin: "10px 0",
    minHeight: "40px"
  },
  facultyMeta: {
    display: "flex",
    justifyContent: "space-between",
    margin: "15px 0",
    fontSize: "12px",
    color: "#888"
  },
  addBtn: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#28a745",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px"
  },
  deleteBtn: { 
    padding: "8px 16px", 
    background: "#dc3545", 
    color: "#fff", 
    borderRadius: 4, 
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
    width: "100%"
  },
  error: { 
    background: "#fdecea", 
    padding: 15, 
    borderRadius: 6, 
    color: "#d93025", 
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  retryBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    background: "#f8f9fa",
    borderRadius: 10,
    color: "#666"
  },
  loading: { 
    textAlign: "center", 
    padding: 50, 
    fontSize: 18 
  },
};

export default ManageFaculties;