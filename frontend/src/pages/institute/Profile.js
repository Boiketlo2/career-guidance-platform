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
    // Clear messages when user starts typing
    if (message) setMessage("");
    if (error) setError("");
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
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
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

  const handleCancel = () => {
    fetchProfile(); // Reload original data
    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Institute Profile</h1>
          <p style={styles.subtitle}>Manage your institution's information and settings</p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={styles.success}>
          <div style={styles.successIcon}>✓</div>
          <div style={styles.successContent}>
            <strong style={styles.successTitle}>Success</strong>
            <div style={styles.successMessage}>{message}</div>
          </div>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
        </div>
      )}

      <div style={styles.profileGrid}>
        {/* Basic Information Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Basic Information</h3>
            <div style={styles.cardSubtitle}>Update your institution's core details</div>
          </div>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Institution Name <span style={styles.required}>*</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={profile.name} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                  disabled={updating}
                  placeholder="Enter institution name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address <span style={styles.required}>*</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={profile.email} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                  disabled={updating}
                  placeholder="institution@example.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Location <span style={styles.required}>*</span>
                </label>
                <input 
                  type="text" 
                  name="location" 
                  value={profile.location} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                  disabled={updating}
                  placeholder="City, Country"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Contact Number <span style={styles.required}>*</span>
                </label>
                <input 
                  type="text" 
                  name="contact" 
                  value={profile.contact} 
                  onChange={handleChange} 
                  required 
                  style={styles.input}
                  disabled={updating}
                  placeholder="+266 1234 5678"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Institution Type</label>
                <select 
                  name="type" 
                  value={profile.type} 
                  onChange={handleChange}
                  style={styles.select}
                  disabled={updating}
                >
                  <option value="">Select type</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Community">Community</option>
                  <option value="Technical">Technical</option>
                  <option value="Vocational">Vocational</option>
                  <option value="University">University</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Website</label>
                <input 
                  type="url" 
                  name="website" 
                  value={profile.website} 
                  onChange={handleChange} 
                  style={styles.input}
                  disabled={updating}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={profile.description}
                onChange={handleChange}
                rows="4"
                style={styles.textarea}
                disabled={updating}
                placeholder="Describe your institution, programs, and key features..."
              />
              <div style={styles.helperText}>
                Provide a comprehensive description to attract students
              </div>
            </div>

            <div style={styles.formActions}>
              <button 
                type="submit" 
                disabled={updating || !profile.name || !profile.email || !profile.location || !profile.contact}
                style={updating || !profile.name || !profile.email || !profile.location || !profile.contact ? styles.primaryButtonDisabled : styles.primaryButton}
              >
                {updating ? (
                  <div style={styles.buttonContent}>
                    <div style={styles.smallSpinner}></div>
                    Updating Profile...
                  </div>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                style={styles.secondaryButton}
                disabled={updating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Statistics Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Institution Overview</h3>
            <div style={styles.cardSubtitle}>Key information and statistics</div>
          </div>
          
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🏛️</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Institution ID</div>
                <div style={styles.statValue}>{institutionId}</div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>📊</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Status</div>
                <div style={styles.statValueActive}>{profile.status || "Active"}</div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>📅</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Member Since</div>
                <div style={styles.statValue}>
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🔄</div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Last Updated</div>
                <div style={styles.statValue}>
                  {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div style={styles.additionalInfo}>
            <h4 style={styles.infoTitle}>Profile Completeness</h4>
            <div style={styles.progressSection}>
              <div style={styles.progressBar}>
                <div style={styles.progressFill}></div>
              </div>
              <div style={styles.progressText}>85% Complete</div>
            </div>
            <div style={styles.infoTips}>
              <div style={styles.tipItem}>
                <span style={styles.tipIcon}>💡</span>
                <span style={styles.tipText}>Add a website to increase credibility</span>
              </div>
              <div style={styles.tipItem}>
                <span style={styles.tipIcon}>💡</span>
                <span style={styles.tipText}>Complete description attracts more students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fafbfc',
    padding: '0 20px 40px 20px',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    background: '#ffffff',
    padding: '30px',
    marginBottom: 24,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9'
  },
  headerContent: {
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
    fontWeight: '400'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9',
    padding: '32px',
    transition: 'all 0.2s ease'
  },
  cardHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f0f0f0'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: '14px'
  },
  required: {
    color: '#dc2626'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '15px',
    background: '#ffffff',
    color: '#1a1a1a',
    transition: 'all 0.2s ease'
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '15px',
    background: '#ffffff',
    color: '#1a1a1a',
    transition: 'all 0.2s ease'
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '15px',
    background: '#ffffff',
    color: '#1a1a1a',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  },
  helperText: {
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '4px'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f0'
  },
  primaryButton: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    flex: 2,
    transition: 'all 0.2s ease'
  },
  primaryButtonDisabled: {
    background: '#8c8c8c',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '15px',
    flex: 2
  },
  secondaryButton: {
    background: 'transparent',
    color: '#333',
    border: '1px solid #d0d7de',
    padding: '14px 28px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    flex: 1,
    transition: 'all 0.2s ease'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#fafbfc',
    borderRadius: '6px',
    border: '1px solid #e1e5e9'
  },
  statIcon: {
    fontSize: '20px',
    flexShrink: 0
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  statValueActive: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f7a0f'
  },
  additionalInfo: {
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f0'
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 16px 0'
  },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  progressBar: {
    flex: 1,
    height: '8px',
    background: '#e1e5e9',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: '#1a1a1a',
    borderRadius: '4px',
    width: '85%'
  },
  progressText: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    minWidth: '60px'
  },
  infoTips: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tipIcon: {
    fontSize: '14px',
    flexShrink: 0
  },
  tipText: {
    fontSize: '13px',
    color: '#666'
  },
  success: {
    background: '#f0f9ff',
    padding: '20px',
    borderRadius: 8,
    color: '#0369a1',
    marginBottom: 24,
    border: '1px solid #bae6fd',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    maxWidth: '1200px',
    margin: '0 auto 24px auto'
  },
  successIcon: {
    fontSize: '16px',
    flexShrink: 0,
    fontWeight: 'bold'
  },
  successContent: {
    flex: 1
  },
  successTitle: {
    display: 'block',
    marginBottom: 4,
    fontSize: '14px'
  },
  successMessage: {
    fontSize: '14px',
    opacity: 0.9
  },
  error: {
    background: '#fef2f2',
    padding: '20px',
    borderRadius: 8,
    color: '#dc2626',
    marginBottom: 24,
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    maxWidth: '1200px',
    margin: '0 auto 24px auto'
  },
  errorIcon: {
    fontSize: '16px',
    flexShrink: 0
  },
  errorContent: {
    flex: 1
  },
  errorTitle: {
    display: 'block',
    marginBottom: 4,
    fontSize: '14px'
  },
  errorMessage: {
    fontSize: '14px',
    opacity: 0.9
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    textAlign: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #1a1a1a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  }
};

// Add CSS for spinner animation
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

export default Profile;
