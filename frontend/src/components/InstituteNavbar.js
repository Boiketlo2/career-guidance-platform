// src/components/InstituteNavbar.js
import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const InstituteNavbar = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/institute/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "white",
      padding: "0 20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      height: "60px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h3 style={{ margin: 0, color: "#333" }}>Institute Dashboard</h3>
        <div style={{ display: "flex", gap: "15px" }}>
          <Link 
            to={`/institutes/${institutionId}/dashboard`}
            style={{
              textDecoration: "none",
              color: "#333",
              padding: "8px 12px",
              borderRadius: "4px"
            }}
          >
            Dashboard
          </Link>
          <Link 
            to={`/institutes/${institutionId}/faculties/add`}
            style={{
              textDecoration: "none",
              color: "#333",
              padding: "8px 12px",
              borderRadius: "4px"
            }}
          >
            Faculties
          </Link>
          <Link 
            to={`/institutes/${institutionId}/courses/add`}
            style={{
              textDecoration: "none",
              color: "#333",
              padding: "8px 12px",
              borderRadius: "4px"
            }}
          >
            Courses
          </Link>
          <Link 
            to={`/institutes/${institutionId}/applications`}
            style={{
              textDecoration: "none",
              color: "#333",
              padding: "8px 12px",
              borderRadius: "4px"
            }}
          >
            Applications
          </Link>
          <Link 
            to={`/institutes/${institutionId}/admissions`}
            style={{
              textDecoration: "none",
              color: "#333",
              padding: "8px 12px",
              borderRadius: "4px"
            }}
          >
            Admissions
          </Link>
          <Link 
            to={`/institutes/${institutionId}/profile`}
            style={{
              textDecoration: "none",
              color: "#333",
              padding: "8px 12px",
              borderRadius: "4px"
            }}
          >
            Profile
          </Link>
        </div>
      </div>
      
      <button 
        onClick={handleLogout}
        style={{
          background: "#dc3545",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "500"
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default InstituteNavbar;