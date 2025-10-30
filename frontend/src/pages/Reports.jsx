import React, { useEffect, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";

function Reports() {
  const [summary, setSummary] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [modalData, setModalData] = useState(null); // modal state

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const auth = getAuth();

  // Get fresh Firebase token
  const getFreshToken = useCallback(async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    return null;
  }, [auth]);

  // Fetch summary and details
  const fetchReports = useCallback(async () => {
    const token = await getFreshToken();
    if (!token) return;

    try {
      const summaryRes = await fetch(`${BACKEND_URL}/api/admin/reports/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!summaryRes.ok) throw new Error(`HTTP ${summaryRes.status}`);
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const [instRes, usersRes, compRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/institutions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/admin/companies`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!instRes.ok || !usersRes.ok || !compRes.ok) throw new Error("Failed to fetch details");

      const [instData, usersData, compData] = await Promise.all([
        instRes.json(),
        usersRes.json(),
        compRes.json(),
      ]);

      setInstitutions(instData.institutions || []);
      setUsers(usersData.users || []);
      setCompanies(compData.companies || []);
    } catch (err) {
      console.error("Reports fetch error:", err.message);
    }
  }, [BACKEND_URL, getFreshToken]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Delete user
  const deleteUser = async (userId) => {
    const token = await getFreshToken();
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchReports();
    } catch (err) {
      console.error(err.message);
    }
  };

  // Approve company
  const approveCompany = async (companyId) => {
    const token = await getFreshToken();
    if (!token) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/companies/${encodeURIComponent(companyId)}/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to approve company");
      fetchReports();
    } catch (err) {
      console.error("Approve error:", err.message);
    }
  };

  // Open modal
  const viewItem = (item, type) => {
    setModalData({ item, type });
  };

  const closeModal = () => setModalData(null);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">System Reports & Management</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Institutions</h2>
          <p className="text-3xl font-bold text-blue-600">{summary.totalInstitutions || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Registered Users</h2>
          <p className="text-3xl font-bold text-green-600">{summary.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Registered Companies</h2>
          <p className="text-3xl font-bold text-purple-600">{summary.totalCompanies || 0}</p>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Institutions */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Institutions</h2>
          <table className="w-full table-auto bg-white rounded shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <tr key={inst.id} className="border-b">
                  <td className="p-3">{inst.name}</td>
                  <td className="p-3">{inst.location || "-"}</td>
                  <td className="p-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => viewItem(inst, "Institution")}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Users */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Registered Users</h2>
          <table className="w-full table-auto bg-white rounded shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <button
                      className="text-red-600 hover:underline mr-3"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => viewItem(user, "User")}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Companies */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Registered Companies</h2>
          <table className="w-full table-auto bg-white rounded shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Company Name</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((comp) => (
                <tr key={comp.id} className="border-b">
                  <td className="p-3">{comp.name}</td>
                  <td className="p-3">{comp.status}</td>
                  <td className="p-3">
                    <button
                      className="text-blue-600 hover:underline mr-3"
                      onClick={() => viewItem(comp, "Company")}
                    >
                      View
                    </button>
                    {comp.status !== "Approved" && (
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => approveCompany(comp.id)}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6 relative max-h-[90vh] overflow-auto">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-lg font-bold"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">{modalData.type} Details</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(modalData.item, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
