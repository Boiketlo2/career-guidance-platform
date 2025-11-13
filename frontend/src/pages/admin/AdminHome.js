import React from "react";
import { useNavigate } from "react-router-dom";

function AdminHome() {
  const navigate = useNavigate();

  const cards = [
    { 
      title: "Institutions", 
      desc: "Manage higher learning institutions", 
      path: "/admin/institutions",
      icon: "🏛️",
      color: "#1a1a1a"
    },
    { 
      title: "Faculties & Courses", 
      desc: "Add or update faculties and courses", 
      path: "/admin/faculties",
      icon: "📚",
      color: "#0f7a0f"
    },
    { 
      title: "Admissions", 
      desc: "Publish admissions and view applicants", 
      path: "/admin/publish",
      icon: "🎓",
      color: "#0369a1"
    },
    { 
      title: "Companies", 
      desc: "Approve or manage companies", 
      path: "/admin/companies",
      icon: "🏢",
      color: "#7c2d12"
    },
    { 
      title: "Reports", 
      desc: "View and manage reports", 
      path: "/admin/reports",
      icon: "📊",
      color: "#3730a3"
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage the career guidance platform and monitor system activities</p>
        </div>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>5</div>
            <div style={styles.statLabel}>Modules</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>Active</div>
            <div style={styles.statLabel}>Status</div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div style={styles.grid}>
        {cards.map((card) => (
          <div 
            key={card.title} 
            onClick={() => navigate(card.path)} 
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={{...styles.cardIcon, backgroundColor: `${card.color}15`}}>
                <span style={{...styles.icon, color: card.color}}>{card.icon}</span>
              </div>
              <h2 style={styles.cardTitle}>{card.title}</h2>
            </div>
            <p style={styles.cardDesc}>{card.desc}</p>
            <div style={styles.cardArrow}>→</div>
          </div>
        ))}
      </div>

      {/* Quick Stats Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerItem}>
            <span style={styles.footerLabel}>System Status:</span>
            <span style={styles.footerValue}>All Systems Operational</span>
          </div>
          <div style={styles.footerItem}>
            <span style={styles.footerLabel}>Last Updated:</span>
            <span style={styles.footerValue}>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: "100vh", 
    background: "#fafbfc", 
    padding: "0 20px 40px 20px", 
    fontFamily: "'Inter', sans-serif" 
  },
  header: {
    background: "#ffffff",
    padding: "40px 0",
    marginBottom: "40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderBottom: "1px solid #e1e5e9"
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
    padding: "0 20px"
  },
  title: { 
    fontSize: "36px", 
    fontWeight: "700", 
    marginBottom: "12px", 
    color: "#1a1a1a",
    margin: "0 0 8px 0"
  },
  subtitle: { 
    fontSize: "18px", 
    color: "#666", 
    margin: "0 0 32px 0",
    fontWeight: "400",
    lineHeight: "1.5"
  },
  statsBar: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    marginTop: "24px"
  },
  statItem: {
    textAlign: "center"
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "4px"
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500"
  },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
    gap: "24px", 
    maxWidth: "1200px", 
    margin: "0 auto" 
  },
  card: { 
    background: "#ffffff", 
    padding: "32px 28px", 
    borderRadius: "12px", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9",
    cursor: "pointer", 
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px"
  },
  cardIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  icon: {
    fontSize: "24px"
  },
  cardTitle: { 
    fontSize: "20px", 
    fontWeight: "600", 
    margin: "0",
    color: "#1a1a1a",
    lineHeight: "1.3"
  },
  cardDesc: { 
    fontSize: "15px", 
    color: "#666", 
    margin: "0 0 24px 0",
    lineHeight: "1.5"
  },
  cardArrow: {
    position: "absolute",
    bottom: "24px",
    right: "28px",
    fontSize: "18px",
    color: "#1a1a1a",
    fontWeight: "600",
    transition: "transform 0.2s ease"
  },
  footer: {
    maxWidth: "1200px",
    margin: "48px auto 0 auto",
    padding: "24px",
    background: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e1e5e9"
  },
  footerContent: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    flexWrap: "wrap"
  },
  footerItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  footerLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500"
  },
  footerValue: {
    fontSize: "14px",
    color: "#1a1a1a",
    fontWeight: "600"
  }
};

export default AdminHome;
