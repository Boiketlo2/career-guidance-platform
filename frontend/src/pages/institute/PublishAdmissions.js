// src/pages/institute/PublishAdmissions.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import InstituteNavbar from "../../components/InstituteNavbar";

const PublishAdmissions = () => {
  const { institutionId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchAdmissions = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, `institutions/${institutionId}/admissions`));
        setAdmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching admissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, [institutionId]);

  const handleAddAdmission = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill in all fields!");
      return;
    }

    setPublishing(true);
    try {
      await addDoc(collection(db, `institutions/${institutionId}/admissions`), { 
        title, 
        description,
        publishedAt: new Date(),
        status: "published"
      });
      
      // Update institution to mark admissions as published
      await updateDoc(doc(db, "institutions", institutionId), {
        admissionsPublished: true,
        lastAdmissionUpdate: new Date()
      });
      
      setTitle("");
      setDescription("");
      alert("Admission published successfully!");
      
      // Refresh the admissions list
      const updatedSnap = await getDocs(collection(db, `institutions/${institutionId}/admissions`));
      setAdmissions(updatedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error publishing admission:", error);
      alert("Failed to publish admission");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return (
    <div>
      <InstituteNavbar />
      <div style={{ padding: "20px" }}>Loading admissions...</div>
    </div>
  );

  return (
    <div>
      <InstituteNavbar />
      <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px" }}>
        <h2>Publish Admissions</h2>
        
        <form onSubmit={handleAddAdmission} style={{ marginBottom: "30px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label>Admission Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., 2024 Undergraduate Admissions"
              style={{ width: "100%", padding: "8px" }}
              required
            />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label>Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed information about admissions, requirements, deadlines..."
              style={{ width: "100%", padding: "8px", minHeight: "120px" }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={publishing}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {publishing ? "Publishing..." : "Publish Admission"}
          </button>
        </form>

        <h3>Published Admissions</h3>
        {admissions.length === 0 ? (
          <p>No admissions published yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {admissions.map(a => (
              <div key={a.id} style={{ 
                border: "1px solid #ddd", 
                padding: "15px", 
                borderRadius: "8px",
                backgroundColor: "#f8f9fa"
              }}>
                <h4 style={{ margin: "0 0 10px 0" }}>{a.title}</h4>
                <p style={{ margin: "0 0 10px 0" }}>{a.description}</p>
                <small style={{ color: "#666" }}>
                  Published: {a.publishedAt?.toDate().toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishAdmissions;