// src/pages/company/CompanyProfile.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const CompanyProfile = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) fetchProfile();
  }, [companyId]);

  const fetchProfile = async () => {
    try {
      const res = await companyAPI.getProfile(companyId);
      if (res?.success) setCompany(res.company);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch company profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading company profile...</div>;

  return (
    <div style={styles.container}>
      <h1>Company Profile</h1>
      {company ? (
        <div style={styles.card}>
          <p><strong>Name:</strong> {company.name}</p>
          <p><strong>Email:</strong> {company.email}</p>
          <p><strong>Location:</strong> {company.location}</p>
          <p><strong>Contact:</strong> {company.contact}</p>
          <p><strong>Industry:</strong> {company.industry}</p>
          <p>
            <strong>Status:</strong> {company.status || "Active"}
          </p>
        </div>
      ) : (
        <p>No company information available.</p>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  loading: { padding: "40px", textAlign: "center", fontSize: "1.2rem" },
  card: { padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
};

export default CompanyProfile;
