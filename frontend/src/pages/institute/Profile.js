import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.uid) {
          setError("User not found.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/institute/${user.uid}`
        );
        setInstitute(response.data);
      } catch (err) {
        setError("Failed to load institute profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstitute();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="profile-container">
      <style>
        {`
          .profile-container {
            background-color: #f8f9fa;
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
          }

          .profile-header {
            background-color: #6c8ef7;
            color: white;
            padding: 30px 40px;
            text-align: left;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .profile-header h2 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }

          .profile-header p {
            margin-top: 5px;
            font-size: 16px;
            color: #f0f0f0;
          }

          .profile-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 25px;
            padding: 40px 20px;
          }

          .profile-card {
            background-color: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            padding: 25px;
            width: 350px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .profile-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 14px rgba(0,0,0,0.12);
          }

          .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #6c8ef7;
            margin-bottom: 10px;
            border-bottom: 2px solid #6c8ef7;
            display: inline-block;
            padding-bottom: 4px;
          }

          .card-info {
            font-size: 15px;
            line-height: 1.6;
            margin-top: 5px;
          }

          .card-info span {
            font-weight: 600;
            color: #222;
          }
        `}
      </style>

      <div className="profile-header">
        <h2>Institute Profile</h2>
        <p>Manage and view your institution’s details</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-title">General Information</div>
          <div className="card-info">
            <p><span>Name:</span> {institute?.name || "N/A"}</p>
            <p><span>Email:</span> {institute?.email || "N/A"}</p>
            <p><span>Type:</span> {institute?.type || "N/A"}</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-title">Location & Contact</div>
          <div className="card-info">
            <p><span>Address:</span> {institute?.address || "N/A"}</p>
            <p><span>Phone:</span> {institute?.phone || "N/A"}</p>
            <p><span>Website:</span> {institute?.website || "N/A"}</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-title">About</div>
          <div className="card-info">
            <p>{institute?.description || "No description provided."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
