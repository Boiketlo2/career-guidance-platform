import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { instituteAPI } from "../../api/instituteAPI";

const Profile = () => {
  const { institutionId } = useParams();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    location: "",
    contact: "",
    website: "",
    description: "",
    type: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [institutionId]);

  const fetchProfile = async () => {
    try {
      const response = await instituteAPI.getProfile(institutionId);
      if (response.success) {
        setProfile(response.institution);
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");
    setError("");

    try {
      const response = await instituteAPI.updateProfile(institutionId, profile);
      if (response.success) {
        setMessage("Profile updated successfully!");
      } else {
        setError(response.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="institute-profile">
      <style>{`
        .institute-profile {
          min-height: 100vh;
          padding: 2rem;
          background-color: #f8f9fa;
          color: #333;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .page-header {
          text-align: center;
          background-color: #6c8ef7;
          color: white;
          width: 100%;
          padding: 30px 20px;
          border-radius: 0 0 20px 20px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .page-header p {
          color: #f0f0f0;
          font-size: 1rem;
          margin-top: 5px;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 2rem;
          width: 100%;
          max-width: 1100px;
          margin-top: 1rem;
        }

        .glass-card {
          background-color: white;
          border-radius: 16px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
        }

        h3 {
          font-size: 1.2rem;
          color: #6c8ef7;
          margin-bottom: 1.2rem;
          border-bottom: 2px solid #6c8ef7;
          display: inline-block;
          padding-bottom: 4px;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-weight: 600;
          font-size: 0.95rem;
          color: #333;
        }

        input, select, textarea {
          background-color: #f9f9f9;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 0.8rem;
          color: #333;
          outline: none;
          font-size: 0.95rem;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        input:focus, select:focus, textarea:focus {
          border-color: #6c8ef7;
          background-color: #fff;
        }

        textarea {
          resize: none;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .btn-primary {
          background-color: #6c8ef7;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #5a79e0;
        }

        .btn-secondary {
          background-color: #f1f1f1;
          border: 1px solid #ccc;
          color: #333;
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-secondary:hover {
          background-color: #e8e8e8;
        }

        .success-message {
          background-color: #dff6dd;
          border-left: 4px solid #4caf50;
          padding: 1rem;
          color: #2e7d32;
          border-radius: 8px;
          margin-bottom: 1rem;
          width: 100%;
          max-width: 1100px;
        }

        .error-message {
          background-color: #ffebee;
          border-left: 4px solid #f44336;
          padding: 1rem;
          color: #b71c1c;
          border-radius: 8px;
          margin-bottom: 1rem;
          width: 100%;
          max-width: 1100px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          border: 1px solid #e0e0e0;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #555;
        }

        .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0.5rem;
          color: #222;
        }

        .status-active {
          color: #6c8ef7;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80vh;
          color: #333;
          font-size: 1.2rem;
        }
      `}</style>

      <div className="page-header">
        <h1>Institute Profile</h1>
        <p>Manage your institution's information and settings</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="profile-grid">
        {/* 🧾 Basic Information */}
        <div className="glass-card">
          <h3>Basic Information</h3>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Institution Name *</label>
                <input type="text" id="name" name="name" value={profile.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input type="text" id="location" name="location" value={profile.location} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="contact">Contact Number *</label>
                <input type="text" id="contact" name="contact" value={profile.contact} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="type">Institution Type</label>
                <select id="type" name="type" value={profile.type} onChange={handleChange}>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Community">Community</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input type="url" id="website" name="website" value={profile.website} onChange={handleChange} placeholder="https://example.com" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={profile.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={updating} className="btn-primary">
                {updating ? "Updating Profile..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => window.location.reload()} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* 📊 Statistics */}
        <div className="glass-card">
          <h3>Institution Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Institution ID</span>
              <span className="stat-value">{institutionId}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Status</span>
              <span className="stat-value status-active">{profile.status || "Active"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Member Since</span>
              <span className="stat-value">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">
                {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
