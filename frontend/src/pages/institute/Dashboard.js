// src/pages/institute/Dashboard.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../firebase";
import "./InstituteDashboard.css";

const InstituteDashboard = () => {
  const { instituteId } = useParams();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchInstituteData();
    fetchStudents();
  }, [instituteId]);

  const fetchInstituteData = async () => {
    try {
      const instituteDoc = await getDoc(doc(db, "institutions", instituteId));
      if (instituteDoc.exists()) {
        setInstitute({ id: instituteDoc.id, ...instituteDoc.data() });
      } else {
        setError("Institute not found");
      }
    } catch (error) {
      console.error("Error fetching institute:", error);
      setError("Failed to load institute data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsSnapshot = await getDocs(
        collection(db, "institutions", instituteId, "students")
      );
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleAddInstitution = () => {
    navigate("/institute/register");
  };

  const handleDeleteInstitution = async () => {
    try {
      setLoading(true);
      
      // Delete all students under this institution first
      const studentsSnapshot = await getDocs(
        collection(db, "institutions", instituteId, "students")
      );
      
      const deletePromises = studentsSnapshot.docs.map(studentDoc =>
        deleteDoc(doc(db, "institutions", instituteId, "students", studentDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      // Delete the institution document
      await deleteDoc(doc(db, "institutions", instituteId));
      
      // Sign out the user
      await signOut(auth);
      
      // Redirect to login page
      navigate("/institute/login");
      
    } catch (error) {
      console.error("Error deleting institution:", error);
      setError("Failed to delete institution. Please try again.");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/institute/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error && !institute) {
    return (
      <div className="dashboard-error">
        <div className="error-message">{error}</div>
        <button 
          onClick={() => navigate("/institute/login")}
          className="auth-button"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="institute-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Institute Dashboard</h1>
          <div className="header-actions">
            <button 
              onClick={handleAddInstitution}
              className="btn-primary"
            >
              + Add New Institution
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger"
            >
              🗑️ Delete Institution
            </button>
            <button 
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Institute Info */}
      <div className="dashboard-content">
        <div className="institute-info-card">
          <h2>{institute?.name}</h2>
          <div className="institute-details">
            <p><strong>Email:</strong> {institute?.email}</p>
            <p><strong>Location:</strong> {institute?.location}</p>
            <p><strong>Phone:</strong> {institute?.phone}</p>
            <p><strong>Institution ID:</strong> {instituteId}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            Students ({students.length})
          </button>
          <button 
            className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Students</h3>
                  <p className="stat-number">{students.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Programs</h3>
                  <p className="stat-number">{institute?.programs?.length || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Institution Status</h3>
                  <p className="stat-status active">Active</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="students-tab">
              <div className="students-header">
                <h3>Student Management</h3>
                <button className="btn-primary">
                  + Add Student
                </button>
              </div>
              {students.length === 0 ? (
                <div className="empty-state">
                  <p>No students registered yet.</p>
                  <button className="btn-primary">
                    Add Your First Student
                  </button>
                </div>
              ) : (
                <div className="students-list">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Student ID</th>
                        <th>Program</th>
                        <th>Year</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.studentId}</td>
                          <td>{student.program}</td>
                          <td>{student.year}</td>
                          <td>
                            <button className="btn-small">Edit</button>
                            <button className="btn-small btn-danger">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-tab">
              <h3>Institution Settings</h3>
              <div className="settings-actions">
                <button className="btn-primary">
                  Edit Institution Info
                </button>
                <button className="btn-secondary">
                  Change Password
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-danger"
                >
                  Delete Institution
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Institution</h3>
            <p>
              Are you sure you want to delete <strong>{institute?.name}</strong>? 
              This action will permanently delete all institution data and cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteInstitution}
                className="btn-danger"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete Institution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteDashboard;