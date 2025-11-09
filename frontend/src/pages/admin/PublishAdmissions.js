import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/adminAPI";

export default function PublishAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdmissions();
      if (res.success) setAdmissions(res.admissions);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch admissions");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmissions(); }, []);

  const handlePublish = async (adm) => {
    try {
      await adminAPI.publishAdmissions(adm);
      fetchAdmissions();
    } catch (err) { console.error(err); alert("Failed to publish"); }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Publish Admissions</h1>
      {loading ? <p className="text-center">Loading...</p> : (
        <ul className="max-w-xl mx-auto space-y-2">
          {admissions.map(adm => (
            <li key={adm.id} className="border p-3 rounded flex justify-between items-center bg-white shadow">
              <span>{adm.title} - {adm.published ? "Published" : "Pending"}</span>
              {!adm.published && <button onClick={() => handlePublish(adm)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Publish</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
