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
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchReports(); }, []);

  const deleteUser = async (userId) => { await adminAPI.deleteUser(userId); fetchReports(); };
  const approveCompany = async (companyId) => { await adminAPI.approveCompany(companyId); fetchReports(); };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">System Reports & Management</h1>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab("summary")} className={`px-4 py-2 rounded ${activeTab === "summary" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}>Summary</button>
        <button onClick={() => setActiveTab("companies")} className={`px-4 py-2 rounded ${activeTab === "companies" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}>Companies</button>
      </div>

      {activeTab === "summary" && (
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow"><h2 className="text-lg font-semibold">Total Institutions</h2><p className="text-3xl font-bold text-blue-600">{summary.totalInstitutions || 0}</p></div>
            <div className="bg-white p-6 rounded-lg shadow"><h2 className="text-lg font-semibold">Registered Users</h2><p className="text-3xl font-bold text-green-600">{summary.totalUsers || 0}</p></div>
            <div className="bg-white p-6 rounded-lg shadow"><h2 className="text-lg font-semibold">Registered Companies</h2><p className="text-3xl font-bold text-purple-600">{summary.totalCompanies || 0}</p></div>
          </div>
        </div>
      )}

      {activeTab === "companies" && (
        <div className="max-w-xl mx-auto space-y-2">
          {companies.map(c => (
            <div key={c.id} className="border p-3 rounded flex justify-between items-center bg-white shadow">
              <span>{c.name} - {c.status}</span>
              {c.status !== "Approved" && <button onClick={() => approveCompany(c.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
