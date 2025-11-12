import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const dashboardRoutes = {
    student: (id) => `/student/${id}/home`,
    institution: (id) => `/institute/${id}/home`,
    company: (id) => `/company/${id}/home`,
  };

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
        backgroundColor: "#f8f9fa", // very light grey background
        color: "#111",
      }}
    >
      {/* HERO SECTION */}
      <header
        style={{
          textAlign: "center",
          padding: "6rem 2rem 3rem",
          backgroundColor: "#fff",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <h1 style={{ fontSize: "2.8rem", fontWeight: "700", marginBottom: "1rem" }}>
          Career Guidance & Employment Integration
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#555", maxWidth: "700px", margin: "0 auto" }}>
          Helping students in Lesotho discover higher learning institutions, apply online,
          and transition smoothly into the job market with trusted company partnerships.
        </p>

        {/* Buttons */}
        {!user ? (
          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <Link
              to="/login"
              style={{
                backgroundColor: "#000",
                color: "#fff",
                padding: "12px 30px",
                borderRadius: "6px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#333")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#000")}
            >
              Login
            </Link>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                to="/register/student"
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#000",
                  padding: "12px 30px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  border: "1px solid #ccc",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f1f3f5")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#e9ecef")}
              >
                Student
              </Link>
              <Link
                to="/register/institution"
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#000",
                  padding: "12px 30px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  border: "1px solid #ccc",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f1f3f5")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#e9ecef")}
              >
                Institution
              </Link>
              <Link
                to="/register/company"
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#000",
                  padding: "12px 30px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  border: "1px solid #ccc",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f1f3f5")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#e9ecef")}
              >
                Company
              </Link>
            </div>
          </div>
        ) : (
          <Link
            to={dashboardLink}
            style={{
              display: "inline-block",
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 30px",
              borderRadius: "6px",
              fontWeight: "600",
              textDecoration: "none",
              marginTop: "2rem",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#333")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#000")}
          >
            Go to Dashboard
          </Link>
        )}
      </header>

      {/* FEATURE CARDS */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          padding: "4rem 2rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "2rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            border: "1px solid #dee2e6",
          }}
        >
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}> For Students</h3>
          <p style={{ color: "#555" }}>
            Explore universities and colleges in Lesotho, compare courses, and apply online
            with your academic credentials securely stored on the platform.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "2rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            border: "1px solid #dee2e6",
          }}
        >
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}> For Institutions</h3>
          <p style={{ color: "#555" }}>
            Register your institution, publish available programs, receive applications,
            and manage admissions with verified student information.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "2rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            border: "1px solid #dee2e6",
          }}
        >
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}> For Companies</h3>
          <p style={{ color: "#555" }}>
            Post job opportunities, filter qualified graduates automatically, and
            connect with candidates ready for employment interviews.
          </p>
        </div>
      </section>
  );
};

export default Home;
