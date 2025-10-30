import React, { useEffect, useState } from "react";
import { auth } from "../firebase"; // Firebase auth

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/admin";

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${API_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error("Fetch companies error:", err);
      setError("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Approve company
  const handleApprove = async (id) => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${API_URL}/companies/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchCompanies();
    } catch (err) {
      console.error("Approve error:", err);
      setError("Failed to approve company.");
    } finally {
      setLoading(false);
    }
  };

  // Suspend company
  const handleSuspend = async (id) => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${API_URL}/companies/${id}/suspend`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchCompanies();
    } catch (err) {
      console.error("Suspend error:", err);
      setError("Failed to suspend company.");
    } finally {
      setLoading(false);
    }
  };

  // Delete company
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${API_URL}/companies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchCompanies();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50 text-center">
      <h1 className="text-3xl font-bold mb-6">Manage Registered Companies</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!loading && companies.length === 0 && <p>No companies found.</p>}

      <div className="grid gap-6 max-w-4xl mx-auto">
        {companies.map((company) => (
          <div
            key={company.id}
            className="border bg-white rounded-lg p-5 shadow-md flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="font-bold text-lg">{company.name}</h2>
              <p className="text-gray-600">{company.email}</p>
              <p className="text-sm mt-1">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    company.status?.toLowerCase() === "approved"
                      ? "text-green-600"
                      : company.status?.toLowerCase() === "suspended"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {company.status || "Pending"}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              {company.status?.toLowerCase() !== "approved" && (
                <button
                  onClick={() => handleApprove(company.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={loading}
                >
                  Approve
                </button>
              )}
              {company.status?.toLowerCase() === "approved" && (
                <button
                  onClick={() => handleSuspend(company.id)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  disabled={loading}
                >
                  Suspend
                </button>
              )}
              <button
                onClick={() => handleDelete(company.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
