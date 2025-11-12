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
    type: ""
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
    setProfile(prev => ({
      ...prev,
      [name]: value
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
          background: linear-gradient(135deg, rgba(34,40,49,1), rgba(57,62,70,1));
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #fff;
          font-family: "Inter", sans-serif;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
        }

        .page-header p {
          color: rgba(255, 255, 255, 0.7);
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }

        .glass-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
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
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          font-size: 0.95rem;
          color: #fff;
        }

        input, select, textarea {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 10px;
          padding: 0.8rem;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
        }

        input:focus, select:focus, textarea:focus {
          background: rgba(255, 255, 255, 0.25);
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
          background: linear-gradient(135deg, #00adb5, #00e0c6);
          color: #fff;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.3s ease;
          font-weight: 600;
        }

        .btn-primary:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #00e0c6, #00adb5);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          border-radius: 12px;
          padding: 0.8rem 1.5rem;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .profile-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.12);
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .status-active {
          color: #00e0c6;
        }

        .success-message {
          background: rgba(0, 255, 150, 0.2);
          padding: 1rem;
          border-radius: 10px;
          color: #00ffcc;
          margin-bottom: 1rem;
        }

        .error-message {
          background: rgba(255, 99, 99, 0.2);
          padding: 1rem;
          border-radius: 10px;
          color: #ff7070;
          margin-bottom: 1rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80vh;
          color: #fff;
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
        {/* 🧾 Basic Information Card */}
        <div className="glass-card" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={profile.description}
                onChange={handleChange}
                placeholder="Brief description of your institution, programs offered, mission, etc."
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

        {/* 📊 Institution Statistics Card */}
        <div className="glass-card" onClick={() => alert('Statistics card clicked!')}>
          <h3>Institution Statistics</h3>
          <div className="profile-stats">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Institution ID</span>
                <span className="stat-value">{institutionId}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className={`stat-value status-${profile.status || 'active'}`}>{profile.status || 'Active'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Updated</span>
                <span className="stat-value">{profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
