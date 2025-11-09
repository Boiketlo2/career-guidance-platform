import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/adminAPI";
import { useNavigate } from "react-router-dom";

export default function ManageInstitutes() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    authUserId: "",
    contact: "",
    email: "",
    name: "",
    location: "",
    type: "",
    status: "active",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchInstitutions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getInstitutions();
      if (res.success) setInstitutions(res.institutions);
      else setError("Failed to load institutions");
    } catch (err) {
      console.error(err);
      setError("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInstitutions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.type || !form.authUserId || !form.email || !form.contact) 
      return setError("Please fill in all required fields");

    setLoading(true);
    const timestamp = new Date().toISOString();
    const payload = {
      ...form,
      createdAt: editingId ? form.createdAt : timestamp,
      updatedAt: timestamp,
    };

    try {
      if (editingId) await adminAPI.updateInstitution(editingId, payload);
      else await adminAPI.addInstitution(payload);

      setForm({
        authUserId: "",
        contact: "",
        email: "",
        name: "",
        location: "",
        type: "",
        status: "active",
        description: "",
      });
      setEditingId(null);
      setShowAddForm(false);
      fetchInstitutions();
    } catch (err) {
      console.error(err);
      setError("Failed to save institution");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await adminAPI.deleteInstitution(id);
      fetchInstitutions();
    } catch (err) {
      console.error(err);
      setError("Failed to delete institution");
    }
  };

  const handleEdit = (inst) => {
    setEditingId(inst.id);
    setForm(inst);
    setShowAddForm(true);
  };

  // --- Internal CSS ---
  const styles = {
    container: {
      padding: "40px",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
    },
    title: { fontSize: "28px", fontWeight: "700" },
    returnBtn: {
      backgroundColor: "#555",
      color: "#fff",
      padding: "8px 16px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    cardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 12px rgba(0,0,0,0.15)",
    },
    btn: {
      padding: "6px 12px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      color: "#fff",
    },
    editBtn: { backgroundColor: "#f0ad4e" },
    deleteBtn: { backgroundColor: "#d9534f" },
    addCard: {
      backgroundColor: "#e0f7fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      cursor: "pointer",
      minHeight: "200px",
      textAlign: "center",
      fontWeight: "700",
      color: "#00796b",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    input: {
      width: "100%",
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "10px",
    },
    textarea: {
      width: "100%",
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "10px",
      minHeight: "60px",
    },
    submitBtn: {
      width: "100%",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#00796b",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "700",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Institutions</h1>
        <button style={styles.returnBtn} onClick={() => navigate("/")}>
          Return to Homepage
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>{error}</p>}
      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      <div style={styles.grid}>

        {/* Existing Institution Cards */}
        {institutions.map((inst) => (
          <div
            key={inst.id}
            style={styles.card}
            onClick={() => handleEdit(inst)}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "700" }}>{inst.name}</h3>
              <p style={{ color: "#666" }}>{inst.location}</p>
              <p style={{ color: "#666", fontStyle: "italic" }}>{inst.type}</p>
              <p style={{ color: "#666" }}>{inst.contact} | {inst.email}</p>
              <p style={{ fontSize: "14px", marginTop: "10px" }}>{inst.description}</p>
            </div>
            <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "10px" }}>
              <button style={{ ...styles.btn, ...styles.editBtn }} onClick={(e) => { e.stopPropagation(); handleEdit(inst); }}>Edit</button>
              <button style={{ ...styles.btn, ...styles.deleteBtn }} onClick={(e) => { e.stopPropagation(); handleDelete(inst.id); }}>Delete</button>
            </div>
          </div>
        ))}

        {/* Add Institution Card */}
        <div
          style={styles.addCard}
          onClick={() => setShowAddForm(!showAddForm)}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          {!showAddForm ? (
            <span>+ Add New Institution</span>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <input style={styles.input} placeholder="Auth User ID" value={form.authUserId} onChange={(e) => setForm({ ...form, authUserId: e.target.value })} required />
              <input style={styles.input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input style={styles.input} placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              <input style={styles.input} placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
              <input style={styles.input} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <select style={styles.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                <option value="">Select Type</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
              <textarea style={styles.textarea} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button type="submit" style={styles.submitBtn}>{loading ? "Saving..." : editingId ? "Save Changes" : "Add Institution"}</button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
