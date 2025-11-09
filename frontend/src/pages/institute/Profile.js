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
      <div className="page-header">
        <h1>Institute Profile</h1>
        <p>Manage your institution's information and settings</p>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Institution Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={profile.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Number *</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={profile.contact}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Institution Type</label>
              <select
                id="type"
                name="type"
                value={profile.type}
                onChange={handleChange}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Community">Community</option>
                <option value="Technical">Technical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
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
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={updating}
            className="btn-primary"
          >
            {updating ? "Updating Profile..." : "Save Changes"}
          </button>
          
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="profile-stats">
        <h3>Institution Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Institution ID</span>
            <span className="stat-value">{institutionId}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status</span>
            <span className={`stat-value status-${profile.status || 'active'}`}>
              {profile.status || 'Active'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Member Since</span>
            <span className="stat-value">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Updated</span>
            <span className="stat-value">
              {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;