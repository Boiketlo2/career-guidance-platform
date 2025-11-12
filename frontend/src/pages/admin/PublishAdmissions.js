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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handlePublish = async (adm) => {
    try {
      await adminAPI.publishAdmissions(adm);
      fetchAdmissions();
    } catch (err) {
      console.error(err);
      alert("Failed to publish");
    }
  };

  return (
    <div className="publish-admissions-page">
      <style>{`
        .publish-admissions-page {
          min-height: 100vh;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 197, 253, 0.15));
          backdrop-filter: blur(8px);
          padding: 60px 20px;
          font-family: 'Poppins', sans-serif;
        }

        .publish-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 40px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .admissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .admission-card {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          padding: 25px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .admission-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        }

        .admission-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 10px;
        }

        .admission-status {
          font-size: 0.95rem;
          margin-bottom: 15px;
        }

        .status-published {
          color: #16a34a;
          font-weight: 600;
        }

        .status-pending {
          color: #f59e0b;
          font-weight: 600;
        }

        .publish-btn {
          align-self: flex-start;
          background: linear-gradient(90deg, #2563eb, #1e40af);
          color: white;
          padding: 10px 18px;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .publish-btn:hover {
          background: linear-gradient(90deg, #1d4ed8, #1e3a8a);
          transform: translateY(-2px);
        }

        .loading, .no-admissions {
          text-align: center;
          font-size: 1.1rem;
          color: #374151;
          margin-top: 40px;
        }
      `}</style>

      <h1 className="publish-title">Publish Admissions</h1>

      {loading ? (
        <p className="loading">Loading admissions...</p>
      ) : admissions.length === 0 ? (
        <p className="no-admissions">No admissions available.</p>
      ) : (
        <div className="admissions-grid">
          {admissions.map((adm) => (
            <div key={adm.id} className="admission-card">
              <div>
                <h2 className="admission-title">{adm.title}</h2>
                <p className="admission-status">
                  Status:{" "}
                  <span
                    className={
                      adm.published ? "status-published" : "status-pending"
                    }
                  >
                    {adm.published ? "Published" : "Pending"}
                  </span>
                </p>
              </div>
              {!adm.published && (
                <button
                  onClick={() => handlePublish(adm)}
                  className="publish-btn"
                >
                  Publish
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
