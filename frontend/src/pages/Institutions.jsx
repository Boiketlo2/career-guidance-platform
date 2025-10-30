import React, { useEffect, useState } from "react";

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newInstitution, setNewInstitution] = useState({
    name: "",
    location: "",
    type: "",
    description: "",
  });
  const [editingInstitution, setEditingInstitution] = useState(null);

  const API_URL = "http://localhost:5000/api/admin/institutions";
  const token = localStorage.getItem("token");

  // ✅ Fetch institutions
  const fetchInstitutions = async () => {
    if (!token) return setError("Please log in first.");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInstitutions(data.institutions || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load institutions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
    // eslint-disable-next-line
  }, []);

  // ➕ Add institution
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newInstitution.name || !newInstitution.location || !newInstitution.type)
      return setError("Please fill in all required fields.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newInstitution),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewInstitution({ name: "", location: "", type: "", description: "" });
      fetchInstitutions();
    } catch (err) {
      console.error("Add error:", err);
      setError("Failed to add institution.");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit institution
  const handleEdit = (inst) => setEditingInstitution(inst);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingInstitution) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/${editingInstitution.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingInstitution),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEditingInstitution(null);
      fetchInstitutions();
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update institution.");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete institution
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this institution?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchInstitutions();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete institution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50 text-center">
      <h1 className="text-3xl font-bold mb-6">Manage Institutions</h1>

      {/* ➕ Add Institution Form */}
      {!editingInstitution ? (
        <form onSubmit={handleAdd} className="space-y-3 mb-10">
          <input
            type="text"
            placeholder="Institution Name"
            value={newInstitution.name}
            onChange={(e) =>
              setNewInstitution({ ...newInstitution, name: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={newInstitution.location}
            onChange={(e) =>
              setNewInstitution({ ...newInstitution, location: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
            required
          />
          <select
            value={newInstitution.type}
            onChange={(e) =>
              setNewInstitution({ ...newInstitution, type: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
            required
          >
            <option value="">Select Type</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
          <textarea
            placeholder="Description"
            value={newInstitution.description}
            onChange={(e) =>
              setNewInstitution({ ...newInstitution, description: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
          />
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Institution"}
            </button>
          </div>
        </form>
      ) : (
        // ✏️ Edit Institution Form
        <form onSubmit={handleUpdate} className="space-y-3 mb-10">
          <input
            type="text"
            value={editingInstitution.name}
            onChange={(e) =>
              setEditingInstitution({ ...editingInstitution, name: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
            required
          />
          <input
            type="text"
            value={editingInstitution.location}
            onChange={(e) =>
              setEditingInstitution({ ...editingInstitution, location: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
            required
          />
          <select
            value={editingInstitution.type}
            onChange={(e) =>
              setEditingInstitution({ ...editingInstitution, type: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
            required
          >
            <option value="">Select Type</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
          <textarea
            value={editingInstitution.description}
            onChange={(e) =>
              setEditingInstitution({ ...editingInstitution, description: e.target.value })
            }
            className="border rounded px-3 py-2 w-64"
          />
          <div>
            <button
              type="submit"
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditingInstitution(null)}
              className="ml-4 bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 🏫 Institutions List */}
      {loading ? (
        <p>Loading institutions...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : institutions.length === 0 ? (
        <p>No institutions found.</p>
      ) : (
        <div className="grid gap-4 justify-center">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className="border p-4 rounded-lg bg-white shadow max-w-md mx-auto"
            >
              <h3 className="font-bold text-lg">{inst.name}</h3>
              <p className="text-gray-600">{inst.location}</p>
              <p className="text-gray-600 italic">{inst.type}</p>
              <p className="text-sm mt-2">{inst.description}</p>
              <div className="mt-3 flex justify-center gap-4">
                <button
                  onClick={() => handleEdit(inst)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(inst.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
