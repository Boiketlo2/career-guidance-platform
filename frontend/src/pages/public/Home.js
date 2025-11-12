import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // 🧭 Dashboard route map
  const dashboardRoutes = {
    student: (id) => `/student/${id}/home`,
    institution: (id) => `/institute/${id}/home`,
    company: (id) => `/company/${id}/home`,
  };

  // Determine redirect URL
  const dashboardLink =
    user && dashboardRoutes[user.role]
      ? dashboardRoutes[user.role](user.uid)
      : "/login";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Career Guidance Platform
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Empowering Students, Institutions, and Companies to Connect and Grow
      </p>

      {!user ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 🔹 Login button */}
          <Link
            to="/login"
            style={{
              padding: "12px 24px",
              backgroundColor: "white",
              color: "#667eea",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "600",
              width: "200px",
              margin: "0 auto",
            }}
          >
            Login
          </Link>

          {/* 🔹 Registration options */}
          <div>
            <h3 style={{ marginBottom: "0.5rem" }}>Register as:</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <Link
                to="/register/student"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#667eea",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}
              >
                Student
              </Link>
              <Link
                to="/register/institution"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#764ba2",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}
              >
                Institution
              </Link>
              <Link
                to="/register/company"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#9f7aea",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}
              >
                Company
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <Link
          to={dashboardLink}
          style={{
            padding: "12px 24px",
            backgroundColor: "white",
            color: "#667eea",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: "600",
            marginTop: "2rem",
          }}
        >
          Go to Home
        </Link>
      )}
    </div>
  );
};

export default Home;
