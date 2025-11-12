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
        .report-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .report-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 10px rgba(0,0,0,0.15);
        }
        .approve-btn {
          background-color: #16a34a;
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .approve-btn:hover {
          background-color: #15803d;
        }
      `}</style>

      <h1 className="text-3xl font-bold mb-6 text-center">
        System Reports & Management
      </h1>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 rounded ${
            activeTab === "summary"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("companies")}
          className={`px-4 py-2 rounded ${
            activeTab === "companies"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          Companies
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="report-card text-center">
              <h2 className="text-lg font-semibold">Total Institutions</h2>
              <p className="text-3xl font-bold text-blue-600">
                {summary.totalInstitutions || 0}
              </p>
            </div>
            <div className="report-card text-center">
              <h2 className="text-lg font-semibold">Registered Users</h2>
              <p className="text-3xl font-bold text-green-600">
                {summary.totalUsers || 0}
              </p>
            </div>
            <div className="report-card text-center">
              <h2 className="text-lg font-semibold">Registered Companies</h2>
              <p className="text-3xl font-bold text-purple-600">
                {summary.totalCompanies || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "companies" && (
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {companies.map((c) => (
            <div key={c.id} className="report-card flex justify-between items-center">
              <span>
                <strong>{c.name}</strong> —{" "}
                <span className={c.status === "Approved" ? "text-green-600" : "text-yellow-600"}>
                  {c.status}
                </span>
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
