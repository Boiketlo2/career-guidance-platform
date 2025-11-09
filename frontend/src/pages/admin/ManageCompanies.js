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
    } catch (err) { console.error(err); alert("Failed to fetch companies"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleApprove = async (id) => {
    try { await adminAPI.approveCompany(id); fetchCompanies(); }
    catch (err) { console.error(err); alert("Failed to approve"); }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Companies</h1>
      {loading ? <p className="text-center">Loading...</p> :
        companies.length === 0 ? <p className="text-center">No companies found.</p> :
        <ul className="max-w-xl mx-auto space-y-2">
          {companies.map(c => (
            <li key={c.id} className="border p-3 rounded flex justify-between items-center bg-white shadow">
              <span>{c.name} - {c.approved ? "Approved" : "Pending"}</span>
              {!c.approved && <button onClick={() => handleApprove(c.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>}
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
