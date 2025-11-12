import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/adminAPI";

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCompanies();
      if (res.success) setCompanies(res.companies);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveCompany(id);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Failed to approve");
    }
  };

  return (
    <div className="manage-companies-page">
      <style>{`
        .manage-companies-page {
          min-height: 100vh;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 197, 253, 0.15));
          backdrop-filter: blur(8px);
          padding: 60px 20px;
          font-family: 'Poppins', sans-serif;
        }

        .manage-companies-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 40px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .companies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .company-card {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          padding: 25px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .company-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        }

        .company-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 10px;
        }

        .company-status {
          font-size: 0.95rem;
          margin-bottom: 15px;
        }

        .status-approved {
          color: #16a34a;
          font-weight: 600;
        }

        .status-pending {
          color: #f59e0b;
          font-weight: 600;
        }

        .approve-btn {
          align-self: flex-start;
          background: linear-gradient(90deg, #2563eb, #1e40af);
          color: white;
          padding: 10px 18px;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .approve-btn:hover {
          background: linear-gradient(90deg, #1d4ed8, #1e3a8a);
          transform: translateY(-2px);
        }

        .loading, .no-companies {
          text-align: center;
          font-size: 1.1rem;
          color: #374151;
          margin-top: 40px;
        }
      `}</style>

      <h1 className="manage-companies-title">Manage Companies</h1>

      {loading ? (
        <p className="loading">Loading companies...</p>
      ) : companies.length === 0 ? (
        <p className="no-companies">No companies found.</p>
      ) : (
        <div className="companies-grid">
          {companies.map((c) => (
            <div key={c.id} className="company-card">
              <div>
                <h2 className="company-name">{c.name}</h2>
                <p className="company-status">
                  Status:{" "}
                  <span
                    className={
                      c.approved ? "status-approved" : "status-pending"
                    }
                  >
                    {c.approved ? "Approved" : "Pending Approval"}
                  </span>
                </p>
              </div>
              {!c.approved && (
                <button
                  onClick={() => handleApprove(c.id)}
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
