import React from "react";
import { useNavigate } from "react-router-dom";

function AdminHome() {
  const navigate = useNavigate();

  const cards = [
    { 
      title: "Institutions", 
      desc: "Manage higher learning institutions", 
      path: "/admin/institutions",
      color: "#000000"
    },
    { 
      title: "Faculties & Courses", 
      desc: "Add or update faculties and courses", 
      path: "/admin/faculties",
      color: "#333333"
    },
    { 
      title: "Admissions", 
      desc: "Publish admissions and view applicants", 
      path: "/admin/publish",
      color: "#555555"
    },
    { 
      title: "Companies", 
      desc: "Approve or manage companies", 
      path: "/admin/companies",
      color: "#000000"
    },
    { 
      title: "Reports", 
      desc: "View and manage reports", 
      path: "/admin/reports",
      color: "#333333"
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
            <div style={styles.statNumber}>{cards.length}</div>
            <div style={styles.statLabel}>Management Modules</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>Operational</div>
            <div style={styles.statLabel}>System Status</div>
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
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.18)';
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.querySelector('.cardArrow').style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.querySelector('.cardArrow').style.transform = 'translateX(0)';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={{...styles.cardIcon, backgroundColor: `${card.color}15`, border: `2px solid ${card.color}30`}}>
                <span style={{...styles.icon, color: card.color, fontWeight: '700'}}>▸</span>
              </div>
              <div>
                <h2 style={styles.cardTitle}>{card.title}</h2>
                <p style={styles.cardDesc}>{card.desc}</p>
              </div>
            </div>
            <div className="cardArrow" style={styles.cardArrow}>→</div>
          </div>
        ))}
      </div>

      {/* Quick Stats Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerItem}>
            <span style={styles.footerLabel}>System Status:</span>
            <span style={{...styles.footerValue, color: '#16a34a'}}>All Systems Operational</span>
          </div>
          <div style={styles.footerItem}>
            <span style={styles.footerLabel}>Last Updated:</span>
            <span style={styles.footerValue}>{new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div style={styles.footerItem}>
            <span style={styles.footerLabel}>Active Modules:</span>
            <span style={styles.footerValue}>{cards.length} / {cards.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: "100vh", 
    background: "#f8f9fa", 
    padding: "0 20px 40px 20px", 
    fontFamily: "'Arial', sans-serif" 
  },
  header: {
    background: "#ffffff",
    padding: "50px 0 40px 0",
    marginBottom: "50px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    borderBottom: "1px solid #e8e8e8"
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center",
    padding: "0 20px"
  },
  title: { 
    fontSize: "42px", 
    fontWeight: "700", 
    margin: "0 0 12px 0",
    color: "#000000",
    letterSpacing: "-0.5px"
  },
  subtitle: { 
    fontSize: "18px", 
    color: "#555555", 
    margin: "0 0 40px 0",
    fontWeight: "400",
    lineHeight: "1.6",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  statsBar: {
    display: "flex",
    justifyContent: "center",
    gap: "60px",
    marginTop: "30px"
  },
  statItem: {
    textAlign: "center",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "8px",
    minWidth: "140px"
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "6px"
  },
  statLabel: {
    fontSize: "14px",
    color: "#666666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", 
    gap: "28px", 
    maxWidth: "1200px", 
    margin: "0 auto" 
  },
  card: { 
    background: "#ffffff", 
    padding: "32px", 
    borderRadius: "10px", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "2px solid #e0e0e0",
    cursor: "pointer", 
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    minHeight: "140px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "8px"
  },
  cardIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.3s ease"
  },
  icon: {
    fontSize: "20px",
    fontWeight: "700"
  },
  cardTitle: { 
    fontSize: "22px", 
    fontWeight: "700", 
    margin: "0 0 8px 0",
    color: "#000000",
    lineHeight: "1.3"
  },
  cardDesc: { 
    fontSize: "15px", 
    color: "#666666", 
    margin: "0",
    lineHeight: "1.5",
    fontWeight: "400"
  },
  cardArrow: {
    position: "absolute",
    bottom: "28px",
    right: "32px",
    fontSize: "20px",
    color: "#000000",
    fontWeight: "700",
    transition: "transform 0.2s ease",
    padding: "8px",
    background: "#f8f9fa",
    borderRadius: "6px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  footer: {
    maxWidth: "1200px",
    margin: "60px auto 0 auto",
    padding: "28px 32px",
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e8e8e8"
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-around",
    gap: "30px",
    flexWrap: "wrap"
  },
  footerItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    background: "#f8f9fa",
    borderRadius: "6px",
    minWidth: "200px",
    justifyContent: "center"
  },
  footerLabel: {
    fontSize: "14px",
    color: "#666666",
    fontWeight: "600"
  },
  footerValue: {
    fontSize: "14px",
    color: "#000000",
    fontWeight: "700"
  }
};

export default AdminHome;
