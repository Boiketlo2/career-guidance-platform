import React, { useState } from "react";

function InstitutionForm({ setInstitutions }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/institutions`, {
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
    <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Add New Institution</h2>
      {message && <p className="text-sm text-blue-600 mb-2">{message}</p>}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Institution name"
        className="border p-2 rounded w-full mb-3"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="border p-2 rounded w-full mb-3"
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Institution
      </button>
    </form>
  );
}

export default InstitutionForm;
