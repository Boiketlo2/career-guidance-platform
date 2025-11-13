import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/adminAPI";

export default function SystemReports() {
  const [summary, setSummary] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");

  const fetchReports = async () => {
    try {
      const summaryRes = await adminAPI.getReportsSummary();
      setSummary(summaryRes);
      const [instRes, usersRes, compRes] = await Promise.all([
        adminAPI.getInstitutions(),
        adminAPI.getUsers(),
        adminAPI.getCompanies(),
      ]);
      setInstitutions(instRes.institutions);
      setUsers(usersRes.users);
      setCompanies(compRes.companies);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const approveCompany = async (companyId) => {
    await adminAPI.approveCompany(companyId);
    fetchReports();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <style>{`
        .system-reports-container {
          padding: 2rem;
          min-height: 100vh;
          background-color: #f8f9fa;
          font-family: 'Arial', sans-serif;
        }
        
        .report-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        
        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          border-color: #333333;
        }
        
        .stat-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 2rem 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }
        
        .stat-label {
          font-size: 1rem;
          font-weight: 600;
          color: #555555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .approve-btn {
          background-color: #333333;
          color: #ffffff;
          padding: 0.5rem 1.2rem;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .approve-btn:hover {
          background-color: #000000;
          transform: translateY(-1px);
        }
        
        .tab-button {
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          border: 1px solid #e0e0e0;
          background: #ffffff;
          color: #333333;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tab-button.active {
          background: #333333;
          color: #ffffff;
          border-color: #333333;
        }
        
        .tab-button:hover:not(.active) {
          background: #f5f5f5;
          border-color: #cccccc;
        }
        
        .company-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .company-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-color: #333333;
        }
        
        .status-approved {
          color: #16a34a;
          font-weight: 600;
        }
        
        .status-pending {
          color: #d97706;
          font-weight: 600;
        }
        
        .page-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 2rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .tab-container {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .companies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .loading-state {
          text-align: center;
          color: #333333;
          font-size: 1.1rem;
          font-weight: 600;
          padding: 2rem;
        }
      `}</style>

      <div className="system-reports-container">
        <h1 className="page-title">
          System Reports & Management
        </h1>

        <div className="tab-container">
          <button
            onClick={() => setActiveTab("summary")}
            className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
          >
            Summary Overview
          </button>
          <button
            onClick={() => setActiveTab("companies")}
            className={`tab-button ${activeTab === "companies" ? "active" : ""}`}
          >
            Company Management
          </button>
        </div>

        {activeTab === "summary" && (
          <div className="space-y-8">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Institutions</div>
                <div className="stat-number" style={{ color: "#000000" }}>
                  {summary.totalInstitutions || 0}
                </div>
                <div style={{ color: "#666666", fontSize: "0.9rem" }}>
                  Registered educational institutions
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Registered Users</div>
                <div className="stat-number" style={{ color: "#333333" }}>
                  {summary.totalUsers || 0}
                </div>
                <div style={{ color: "#666666", fontSize: "0.9rem" }}>
                  Students and institutional users
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Registered Companies</div>
                <div className="stat-number" style={{ color: "#555555" }}>
                  {summary.totalCompanies || 0}
                </div>
                <div style={{ color: "#666666", fontSize: "0.9rem" }}>
                  Partner companies for employment
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "companies" && (
          <div className="companies-grid">
            {companies.length === 0 ? (
              <div className="loading-state">
                No companies registered yet.
              </div>
            ) : (
              companies.map((c) => (
                <div key={c.id} className="company-card">
                  <div>
                    <div style={{ fontWeight: "600", color: "#000000", marginBottom: "0.25rem" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#555555" }}>
                      Status:{" "}
                      <span className={c.status === "Approved" ? "status-approved" : "status-pending"}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                  {c.status !== "Approved" && (
                    <button
                      onClick={() => approveCompany(c.id)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
