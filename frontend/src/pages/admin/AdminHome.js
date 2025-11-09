import React from "react";
import { useNavigate } from "react-router-dom";

function AdminHome() {
  const navigate = useNavigate();

  const cards = [
    { title: "Institutions", desc: "Manage higher learning institutions", path: "/admin/institutions" },
    { title: "Faculties & Courses", desc: "Add or update faculties and courses", path: "/admin/faculties" },
    { title: "Admissions", desc: "Publish admissions and view applicants", path: "/admin/publish" },
    { title: "Companies", desc: "Approve or manage companies", path: "/admin/companies" },
    { title: "Reports", desc: "View and manage reports", path: "/admin/reports" },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <div style={styles.grid}>
        {cards.map((c) => (
          <div key={c.title} onClick={() => navigate(c.path)} style={styles.card}>
            <h2 style={styles.cardTitle}>{c.title}</h2>
            <p style={styles.cardDesc}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5", padding: "50px 20px", fontFamily: "'Inter', sans-serif" },
  title: { textAlign: "center", fontSize: "32px", fontWeight: "700", marginBottom: "40px", color: "#222" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#fff", padding: "30px 20px", borderRadius: "16px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)", cursor: "pointer", transition: "all 0.3s ease" },
  cardTitle: { fontSize: "20px", fontWeight: "600", marginBottom: "10px", color: "#333" },
  cardDesc: { fontSize: "15px", color: "#555" },
};

export default AdminHome;
