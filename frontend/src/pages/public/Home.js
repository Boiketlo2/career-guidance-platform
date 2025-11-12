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
        backgroundColor: "#f5f5f5",
        color: "#1a1a1a",
      }}
    >
      {/* HERO SECTION */}
      <header
        style={{
          textAlign: "center",
          padding: "6rem 2rem 4rem",
          backgroundColor: "#fff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
            color: "#1a1a1a",
            letterSpacing: "-0.5px",
            lineHeight: "1.2",
          }}
        >
          Career Guidance & Employment Integration
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#666",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Helping students in Lesotho discover higher learning institutions,
          apply online, and transition smoothly into the job market with trusted
          company partnerships.
        </p>

        {/* Buttons */}
        {!user ? (
          <div
            style={{
              marginTop: "3rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <Link
              to="/login"
              style={{
                backgroundColor: "#1a1a1a",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: "6px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.2s ease",
                border: "1px solid #1a1a1a",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#333";
                e.target.style.borderColor = "#333";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#1a1a1a";
                e.target.style.borderColor = "#1a1a1a";
              }}
            >
              Login
            </Link>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Link
                to="/register/student"
                style={{
                  backgroundColor: "#fff",
                  color: "#1a1a1a",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  border: "1px solid #ccc",
                  transition: "all 0.2s ease",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f8f8";
                  e.target.style.borderColor = "#999";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#fff";
                  e.target.style.borderColor = "#ccc";
                }}
              >
                Student Registration
              </Link>
              <Link
                to="/register/institution"
                style={{
                  backgroundColor: "#fff",
                  color: "#1a1a1a",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  border: "1px solid #ccc",
                  transition: "all 0.2s ease",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f8f8";
                  e.target.style.borderColor = "#999";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#fff";
                  e.target.style.borderColor = "#ccc";
                }}
              >
                Institution Registration
              </Link>
              <Link
                to="/register/company"
                style={{
                  backgroundColor: "#fff",
                  color: "#1a1a1a",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                  border: "1px solid #ccc",
                  transition: "all 0.2s ease",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f8f8";
                  e.target.style.borderColor = "#999";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#fff";
                  e.target.style.borderColor = "#ccc";
                }}
              >
                Company Registration
              </Link>
            </div>
          </div>
        ) : (
          <Link
            to={dashboardLink}
            style={{
              display: "inline-block",
              backgroundColor: "#1a1a1a",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "6px",
              fontWeight: "600",
              textDecoration: "none",
              marginTop: "2.5rem",
              transition: "all 0.2s ease",
              border: "1px solid #1a1a1a",
              fontSize: "1rem",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#333";
              e.target.style.borderColor = "#333";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#1a1a1a";
              e.target.style.borderColor = "#1a1a1a";
            }}
          >
            Go to Dashboard
          </Link>
        )}
      </header>

      {/* FEATURE CARDS */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          padding: "5rem 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2.5rem 2rem",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            transition: "all 0.2s ease",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <h3 style={{ 
            fontSize: "1.4rem", 
            marginBottom: "1.5rem",
            color: "#1a1a1a",
            fontWeight: "600"
          }}>
            For Students
          </h3>
          <p style={{ 
            color: "#666", 
            lineHeight: "1.6",
            fontSize: "0.95rem"
          }}>
            Explore universities and colleges in Lesotho, compare courses, and
            apply online with your academic credentials securely stored on the
            platform.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2.5rem 2rem",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            transition: "all 0.2s ease",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <h3 style={{ 
            fontSize: "1.4rem", 
            marginBottom: "1.5rem",
            color: "#1a1a1a",
            fontWeight: "600"
          }}>
            For Institutions
          </h3>
          <p style={{ 
            color: "#666", 
            lineHeight: "1.6",
            fontSize: "0.95rem"
          }}>
            Register your institution, publish available programs, receive
            applications, and manage admissions with verified student
            information.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2.5rem 2rem",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            transition: "all 0.2s ease",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <h3 style={{ 
            fontSize: "1.4rem", 
            marginBottom: "1.5rem",
            color: "#1a1a1a",
            fontWeight: "600"
          }}>
            For Companies
          </h3>
          <p style={{ 
            color: "#666", 
            lineHeight: "1.6",
            fontSize: "0.95rem"
          }}>
            Post job opportunities, filter qualified graduates automatically,
            and connect with candidates ready for employment interviews.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
