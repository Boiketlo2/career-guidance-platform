import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case "student":
        return [
          { path: `/student/${user.uid}/home`, label: "Home" },
          { path: `/student/${user.uid}/apply`, label: "Apply for Courses" },
          { path: `/student/${user.uid}/jobs`, label: "Job Opportunities" },
          { path: `/student/${user.uid}/results`, label: "Admission Results" },
          { path: `/student/${user.uid}/upload`, label: "Upload Documents" },
        ];
      case "company":
        return [
          { path: `/company/${user.uid}/home`, label: "Home" },
          { path: `/company/${user.uid}/post-job`, label: "Post Jobs" },
          { path: `/company/${user.uid}/applicants`, label: "View Applicants" },
          { path: `/company/${user.uid}/profile`, label: "Company Profile" },
        ];
      case "institution":
        return [
          { path: `/institute/${user.uid}/home`, label: "Home" },
          { path: `/institute/${user.uid}/faculties`, label: "Faculties" },
          { path: `/institute/${user.uid}/courses`, label: "Courses" },
          { path: `/institute/${user.uid}/applications`, label: "Applications" },
          { path: `/institute/${user.uid}/admissions`, label: "Admissions" },
          { path: `/institute/${user.uid}/profile`, label: "Profile" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav
      style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #dee2e6",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* --- LOGO / BRAND NAME --- */}
      <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#000" }}>
        <Link
          to={
            user.role === "student"
              ? `/student/${user.uid}/home`
              : user.role === "institution"
              ? `/institute/${user.uid}/home`
              : `/company/${user.uid}/home`
          }
          style={{ textDecoration: "none", color: "#000" }}
        >
          CareerGuide
        </Link>
      </div>

      {/* --- NAV LINKS --- */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: isActive ? "#000" : "#555",
                textDecoration: "none",
                fontWeight: isActive ? "600" : "400",
                position: "relative",
                paddingBottom: "4px",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#000")}
              onMouseLeave={(e) =>
                (e.target.style.color = isActive ? "#000" : "#555")
              }
            >
              {item.label}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#000",
                    borderRadius: "1px",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* --- USER + LOGOUT BUTTON --- */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ color: "#555", fontSize: "0.95rem" }}>
          {user.email || "User"}
        </span>
        <button
          onClick={logout}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#333")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#000")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
