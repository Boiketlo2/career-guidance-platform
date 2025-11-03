// src/pages/institute/Profile.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

const Profile = () => {
  const { institutionId } = useParams();
  const [profile, setProfile] = useState({ 
    name: "", 
    email: "", 
    location: "", 
    contact: "", 
    website: "" 
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const instDoc = await getDoc(doc(db, "institutions", institutionId));
        if (instDoc.exists()) {
          setProfile(instDoc.data());
        } else {
          console.error("Institution not found");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [institutionId]);

  const handleUpdate = async () => {
    setUpdating(true);
    setMessage("");
    try {
      const instDoc = doc(db, "institutions", institutionId);
      await updateDoc(instDoc, {
        ...profile,
        updatedAt: new Date(),
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
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
      <div style={{ padding: "20px" }}>Loading profile...</div>
    </div>
  );

  return (
    <div>
      <SimpleNav />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1>Institution Profile</h1>
        
        {message && (
          <div style={{ 
            padding: "12px", 
            borderRadius: "4px", 
            marginBottom: "20px",
            backgroundColor: message.includes("success") ? "#d4edda" : "#f8d7da",
            color: message.includes("success") ? "#155724" : "#721c24",
            border: "1px solid #c3e6cb"
          }}>
            {message}
          </div>
        )}
        
        <div style={{ 
          background: "white", 
          padding: "30px", 
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "grid", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Institution Name *
              </label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Location *
              </label>
              <input
                name="location"
                value={profile.location}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Contact Number *
              </label>
              <input
                name="contact"
                value={profile.contact}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                required
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Website
              </label>
              <input
                name="website"
                type="url"
                value={profile.website}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <button 
            onClick={handleUpdate} 
            disabled={updating}
            style={{ 
              marginTop: "30px",
              padding: "12px 24px", 
              backgroundColor: "#667eea", 
              color: "white", 
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
              width: "100%"
            }}
          >
            {updating ? "Updating Profile..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;