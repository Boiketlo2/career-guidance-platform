// src/pages/institute/InstitutionsDirectory.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const InstitutionsDirectory = () => {
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all institutions
        const institutionsSnapshot = await getDocs(collection(db, "institutions"));
        const institutionsData = institutionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInstitutions(institutionsData);

        // Fetch all faculties
        const facultiesSnapshot = await getDocs(collection(db, "faculties"));
        const facultiesData = facultiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFaculties(facultiesData);

        // Fetch all courses
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInstitutionFaculties = (institutionId) => {
    return faculties.filter(faculty => faculty.institutionId === institutionId);
  };

  const getFacultyCourses = (facultyId) => {
    return courses.filter(course => course.facultyId === facultyId);
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading institutions directory...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🎓 Higher Learning Institutions in Lesotho</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Browse all registered institutions, their faculties, and available courses.
      </p>

      {/* Institutions Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
        {institutions.map((institution) => {
          const institutionFaculties = getInstitutionFaculties(institution.id);
          
          return (
            <div key={institution.id} style={{ 
              border: "1px solid #ddd", 
              padding: "20px", 
              borderRadius: "8px",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{institution.name}</h3>
              
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>📍 Location:</strong> {institution.location || "Not specified"}
                </p>
                {institution.contact && (
                  <p style={{ margin: "5px 0", color: "#666" }}>
                    <strong>📞 Contact:</strong> {institution.contact}
                  </p>
                )}
                {institution.email && (
                  <p style={{ margin: "5px 0", color: "#666" }}>
                    <strong>📧 Email:</strong> {institution.email}
                  </p>
                )}
              </div>

              {/* Faculties Preview */}
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#555", fontSize: "16px" }}>
                  Faculties ({institutionFaculties.length})
                </h4>
                {institutionFaculties.length === 0 ? (
                  <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>No faculties registered yet</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {institutionFaculties.slice(0, 3).map(faculty => (
                      <div key={faculty.id} style={{ 
                        padding: "8px", 
                        background: "#f8f9fa", 
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}>
                        <strong>{faculty.name}</strong>
                        {faculty.description && (
                          <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                            {faculty.description}
                          </div>
                        )}
                        {/* Show courses for this faculty */}
                        <div style={{ marginTop: "5px" }}>
                          <small style={{ color: "#667eea" }}>
                            Courses: {getFacultyCourses(faculty.id).length}
                          </small>
                        </div>
                      </div>
                    ))}
                    {institutionFaculties.length > 3 && (
                      <div style={{ color: "#667eea", fontSize: "12px", textAlign: "center" }}>
                        + {institutionFaculties.length - 3} more faculties
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedInstitution(selectedInstitution?.id === institution.id ? null : institution)}
                  style={{
                    background: "#667eea",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}
                >
                  {selectedInstitution?.id === institution.id ? "Hide Details" : "View Details"}
                </button>
                
                {institution.email && (
                  <Link 
                    to="/institute/login"
                    style={{
                      background: "#28a745",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}
                  >
                    Institute Login
                  </Link>
                )}
              </div>

              {/* Expanded Details */}
              {selectedInstitution?.id === institution.id && (
                <div style={{ marginTop: "15px", padding: "15px", background: "#f8f9fa", borderRadius: "4px" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>All Faculties & Courses</h4>
                  {institutionFaculties.length === 0 ? (
                    <p style={{ color: "#666" }}>No faculties available</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {institutionFaculties.map(faculty => {
                        const facultyCourses = getFacultyCourses(faculty.id);
                        return (
                          <div key={faculty.id}>
                            <h5 style={{ margin: "0 0 8px 0", color: "#333" }}>{faculty.name}</h5>
                            {faculty.description && (
                              <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>
                                {faculty.description}
                              </p>
                            )}
                            {facultyCourses.length > 0 ? (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                {facultyCourses.map(course => (
                                  <span 
                                    key={course.id}
                                    style={{
                                      background: "#e9ecef",
                                      color: "#495057",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      fontSize: "12px"
                                    }}
                                  >
                                    {course.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: "#999", fontSize: "12px", margin: 0 }}>No courses available</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div style={{ marginTop: "40px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
        <h3>📊 Directory Statistics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#667eea" }}>
              {institutions.length}
            </div>
            <div style={{ color: "#666" }}>Institutions</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
              {faculties.length}
            </div>
            <div style={{ color: "#666" }}>Faculties</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>
              {courses.length}
            </div>
            <div style={{ color: "#666" }}>Courses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionsDirectory;