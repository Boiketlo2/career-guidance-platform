import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { studentAPI } from "../../api/studentAPI";
import { authAPI } from "../../api/authAPI";

const ProfileManagement = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  // ✅ Fetch student profile
  const fetchStudentProfile = async () => {
    try {
      const res = await studentAPI.getProfile(studentId);
      if (res.success) {
        setStudent(res.student);
        setFormData({
          name: res.student.name || "",
          email: res.student.email || "",
          phone: res.student.phone || "",
          location: res.student.location || "",
        });
        setDocuments(res.student.documents || []);
      } else {
        setMessage("Failed to load student profile.");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setMessage("Error loading profile.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle form field changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Update student profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await studentAPI.updateProfile(studentId, formData);
      if (res.success) {
        setMessage("Profile updated successfully!");
        fetchStudentProfile();
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage("Error updating profile.");
    }
  };

  // ✅ Upload new document
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("document", file);
    try {
      const res = await studentAPI.uploadDocument(studentId, data);
      if (res.success) {
        setMessage("Document uploaded successfully!");
        fetchStudentProfile();
      } else {
        setMessage("Failed to upload document.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="loading">Loading student profile...</div>;

  return (
    <div className="profile-container">
      <h2>Student Profile</h2>

      {message && <div className="alert-box">{message}</div>}

      {/* Profile Form */}
      <form onSubmit={handleUpdate} className="profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email (readonly)</label>
          <input name="email" value={formData.email} disabled />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +266 5000 0000"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City or District"
          />
        </div>

        <button type="submit" className="btn-primary">
          Save Changes
        </button>
      </form>

      {/* Document Upload Section */}
      <section className="upload-section">
        <h3>Uploaded Documents</h3>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <ul className="document-list">
            {documents.map((doc, index) => (
              <li key={index}>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  {doc.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="upload-area">
          <label htmlFor="file-upload" className="upload-btn">
            {uploading ? "Uploading..." : "Upload Document"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </div>
      </section>
    </div>
  );
};

export default ProfileManagement;

