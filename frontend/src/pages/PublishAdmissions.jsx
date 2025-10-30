import React, { useState, useEffect, useCallback } from "react";

function PublishAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [monitoringUsers, setMonitoringUsers] = useState([]);
  const [title, setTitle] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // ✅ Get token from localStorage (stored on login)
  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  // ✅ Fetch admissions + monitoring users
  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.warn("⚠️ No token found — redirect to login if needed.");
      return;
    }

    try {
      // Fetch Admissions
      const resAdmissions = await fetch(`${BACKEND_URL}/api/admin/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resAdmissions.ok) throw new Error(`HTTP ${resAdmissions.status}`);
      const dataAdmissions = await resAdmissions.json();
      setAdmissions(dataAdmissions.admissions || []);

      // Fetch Monitoring Users
      const resUsers = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resUsers.ok) throw new Error(`HTTP ${resUsers.status}`);
      const dataUsers = await resUsers.json();
      setMonitoringUsers(dataUsers.users || []);
    } catch (err) {
      console.error("❌ Error fetching data:", err.message);
      alert("❌ Failed to load data. Please check your backend connection.");
    }
  }, [BACKEND_URL, getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Publish a new admission
  const publishAdmission = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert("❌ Please log in to publish.");

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish admission");

      alert("✅ Admission published successfully!");
      setTitle("");
      fetchData(); // refresh after publishing
    } catch (err) {
      console.error("❌ Publish error:", err.message);
      alert(`❌ ${err.message}`);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Publish Admissions</h1>

      {/* ➕ Publish Admission Form */}
      <form
        onSubmit={publishAdmission}
        className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mb-10"
      >
        <input
          type="text"
          placeholder="Admission Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full mb-3"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 w-full"
        >
          Publish Admission
        </button>
      </form>

      {/* 🎓 Admissions Section */}
      <div className="max-w-3xl mx-auto mb-10">
        <h2 className="text-xl font-semibold mb-4">Admissions</h2>
        {admissions.length > 0 ? (
          <div className="grid gap-4">
            {admissions.map((ad) => (
              <div
                key={ad.id}
                className="bg-white p-4 rounded-lg shadow-sm border"
              >
                <h3 className="font-semibold text-lg">{ad.title}</h3>
                <p className="text-gray-600">
                  Status: <b>{ad.status || "Published"}</b>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No admissions found.</p>
        )}
      </div>

      {/* 👥 Monitoring Users Section */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Monitoring Users</h2>
        {monitoringUsers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitoringUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-all border text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Role: <b>{user.role || "Monitor"}</b>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No monitoring users found.</p>
        )}
      </div>
    </div>
  );
}

export default PublishAdmissions;
