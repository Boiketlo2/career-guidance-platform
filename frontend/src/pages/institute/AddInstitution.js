// src/pages/institute/AddInstitution.js
import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

const AddInstitution = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location) {
      alert("Please fill in all fields!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "institutions"), {
        name,
        location,
        createdAt: new Date(),
      });
      alert("✅ Institution added successfully!");
      setName("");
      setLocation("");
    } catch (error) {
      console.error("Error adding institution:", error);
      alert("❌ Failed to add institution. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add New Institution</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Institution Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter institution name"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Institution"}
        </button>
      </form>
    </div>
  );
};

export default AddInstitution;
