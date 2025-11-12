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

  const deleteUser = async (userId) => {
    await adminAPI.deleteUser(userId);
    fetchReports();
  };
  const approveCompany = async (companyId) => {
    await adminAPI.approveCompany(companyId);
    fetchReports();
  };

  return (
    <div className="system-reports">
      <style>{`
        .system-reports {
          min-height: 100vh;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 197, 253, 0.15));
          backdrop-filter: blur(8px);
          padding: 60px 30px;
          font-family: 'Poppins', sans-serif;
          color: #1e3a8a;
        }

        .page-title {
          text-align: center;
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 40px;
          color: #1e3a8a;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tab-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
        }

        .tab-btn {
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.25);
          color: #1e3a8a;
          backdrop-filter: blur(6px);
        }

        .tab-btn.active {
          background: linear-gradient(90deg, #2563eb, #1e40af);
          color: white;
        }

        .tab-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.4);
        }

        /* Summary Cards */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          max-width: 900px;
          margin: 0 auto;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          padding: 30px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          text-align: center;
          transition: all 0.3s ease;
        }

        .summary-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .summary-card h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1e3a8a;
        }

        .summary-card p {
          font-size: 2rem;
          font-weight: 700;
        }

        .text-blue { color: #2563eb; }
        .text-green { color: #16a34a; }
        .text-purple { color: #7c3aed; }

        /* Companies tab */
        .companies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .company-card {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .company-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .approve-btn {
          background: linear-gradient(90deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .approve-btn:hover {
          background: linear-gradient(90deg, #16a34a, #15803d);
          transform: translateY(-2px);
        }
      `}</style>

      <h1 className="page-title">System Reports & Management</h1>

      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab("summary")}
          className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("companies")}
          className={`tab-btn ${activeTab === "companies" ? "active" : ""}`}
        >
          Companies
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="summary-grid">
          <div className="summary-card">
            <h2>Total Institutions</h2>
            <p className="text-blue">{summary.totalInstitutions || 0}</p>
          </div>
          <div className="summary-card">
            <h2>Registered Users</h2>
            <p className="text-green">{summary.totalUsers || 0}</p>
          </div>
          <div className="summary-card">
            <h2>Registered Companies</h2>
            <p className="text-purple">{summary.totalCompanies || 0}</p>
          </div>
        </div>
      )}

      {activeTab === "companies" && (
        <div className="companies-grid">
          {companies.map((c) => (
            <div key={c.id} className="company-card">
              <span>
                <strong>{c.name}</strong> – {c.status}
              </span>
              {c.status !== "Approved" && (
                <button
                  onClick={() => approveCompany(c.id)}
                  className="approve-btn"
                >
                  Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
