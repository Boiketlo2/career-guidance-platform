import React, { useState } from "react";

function InstituteManagement() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [institutions, setInstitutions] = useState([]);

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/institutions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInstitutions((prev) => [...prev, data.institution]);
      setName("");
      setLocation("");
      setMessage("Institution added successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Institute Management</h2>
      
      <form onSubmit={handleAddInstitution} className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Add New Institution</h3>
        {message && <p className="text-sm text-blue-600 mb-2">{message}</p>}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Institution name"
          className="border p-2 rounded w-full mb-3"
          required
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="border p-2 rounded w-full mb-3"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Institution
        </button>
      </form>

      {/* Institutions List Display */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Existing Institutions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutions.map((institution) => (
            <div key={institution.id} className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="font-bold">{institution.name}</h4>
              <p className="text-gray-600">{institution.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstituteManagement;