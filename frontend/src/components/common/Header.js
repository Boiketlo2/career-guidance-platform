import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      style={{
        backgroundColor: "#fff",
        color: "#000",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #dee2e6",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* --- BRAND NAME --- */}
      <Link
        to="/"
        style={{
          color: "#000",
          textDecoration: "none",
          fontWeight: "700",
          fontSize: "1.4rem",
        }}
      >
        CareerGuide
      </Link>

      {/* --- NAVIGATION --- */}
      <nav>
        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#555", fontSize: "0.95rem" }}>
              Welcome,{" "}
              <strong>
                {user.name ||
                  user.institutionName ||
                  user.companyName ||
                  "User"}
              </strong>
            </span>

            <Link
              to={
                user.role === "admin"
                  ? `/admin/home/${user.uid}`
                  : `/${user.role}/${user.uid}/home`
              }
              style={{
                color: "#000",
                textDecoration: "none",
                fontWeight: "500",
                paddingBottom: "2px",
                borderBottom: "2px solid transparent",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderBottom = "2px solid #000";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderBottom = "2px solid transparent";
              }}
            >
              Home
            </Link>

            <button
              onClick={handleLogout}
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
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#333")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#000")
              }
            >
              Logout
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/login"
              style={{
                color: "#000",
                textDecoration: "none",
                fontWeight: "600",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#333")}
              onMouseLeave={(e) => (e.target.style.color = "#000")}
            >
              Login
            </Link>

            <Link
              to="/register/student"
              style={{
                backgroundColor: "#000",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#333")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "#000")
              }
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
