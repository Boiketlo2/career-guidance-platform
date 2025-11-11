import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/adminAPI";

export default function ManageFacultiesCourses() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state for faculties and courses per institution
  const [facultyForms, setFacultyForms] = useState({});
  const [courseForms, setCourseForms] = useState({});
  const [showFacultyForm, setShowFacultyForm] = useState({});
  const [showCourseForm, setShowCourseForm] = useState({});

  const fetchInstitutions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getInstitutions();
      if (!res.success) throw new Error("Failed to fetch institutions");

      // Initialize forms for each institution
      const facultyInit = {};
      const courseInit = {};
      res.institutions.forEach(inst => {
        facultyInit[inst.id] = { name: "", description: "" };
        courseInit[inst.id] = { name: "", duration: "", requirements: "", facultyId: "" };
      });

      setFacultyForms(facultyInit);
      setCourseForms(courseInit);

      setInstitutions(
        res.institutions.map(inst => ({
          ...inst,
          faculties: inst.faculties || [],
          courses: inst.courses || [],
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInstitutions(); }, []);

  // Add faculty
  const handleAddFaculty = async (institutionId) => {
    const form = facultyForms[institutionId];
    if (!form.name) return setError("Faculty name is required");

    try {
      await adminAPI.addFaculty(institutionId, {
        name: form.name,
        description: form.description,
        institutionId,
        createdAt: new Date().toISOString(),
      });
      setFacultyForms({ ...facultyForms, [institutionId]: { name: "", description: "" } });
      fetchInstitutions();
    } catch (err) {
      console.error(err);
      setError("Failed to save faculty");
    }
  };

  // Add course
  const handleAddCourse = async (institutionId) => {
    const form = courseForms[institutionId];
    if (!form.name || !form.duration || !form.facultyId) return setError("All course fields are required");

    try {
      await adminAPI.addCourse(form.facultyId, {
        name: form.name,
        duration: form.duration,
        requirements: form.requirements,
        facultyId: form.facultyId,
        createdAt: new Date().toISOString(),
      });
      setCourseForms({
        ...courseForms,
        [institutionId]: { name: "", duration: "", requirements: "", facultyId: "" },
      });
      fetchInstitutions();
    } catch (err) {
      console.error(err);
      setError("Failed to save course");
    }
  };

  // --- Internal CSS ---
  const styles = {
    container: { padding: "40px", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "Arial, sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    title: { fontSize: "28px", fontWeight: "700" },
    returnBtn: { backgroundColor: "#555", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
    card: { backgroundColor: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    section: { marginTop: "15px" },
    input: { width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "10px" },
    btn: { padding: "8px 12px", border: "none", borderRadius: "5px", cursor: "pointer", backgroundColor: "#00796b", color: "#fff", fontWeight: "700" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Faculties & Courses</h1>
        <button style={styles.returnBtn} onClick={() => window.location.href = "/"}>Return to Homepage</button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>{error}</p>}
      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      <div className="cg-card-grid" style={{ maxWidth: 1200, margin: '0 auto', gap: 24 }}>
        {institutions.map(inst => (
          <div key={inst.id} className="cg-card" style={{ padding: 20 }}>
            <h2 style={{ fontWeight: "700", fontSize: "20px" }}>{inst.name}</h2>

            {/* Faculties */}
            <div style={styles.section}>
              <h3 style={{ fontWeight: "600" }}>Faculties</h3>
              {inst.faculties.length === 0 ? <p>No faculties</p> : (
                <ul>
                  {inst.faculties.map(fac => <li key={fac.id}>{fac.name}</li>)}
                </ul>
              )}

              {/* Add Faculty button */}
              <div style={{ marginTop: 12 }}>
                <button
                  className="glass-button"
                  onClick={() => setShowFacultyForm({ ...showFacultyForm, [inst.id]: !showFacultyForm[inst.id] })}
                >
                  {showFacultyForm[inst.id] ? 'Cancel' : 'Add Faculty'}
                </button>
              </div>

              {/* Faculty form - toggled */}
              {showFacultyForm[inst.id] && (
                <div style={{ marginTop: 12 }}>
                  <input
                    style={styles.input}
                    placeholder="Faculty Name"
                    value={facultyForms[inst.id]?.name || ""}
                    onChange={(e) => setFacultyForms({ ...facultyForms, [inst.id]: { ...facultyForms[inst.id], name: e.target.value } })}
                  />
                  <input
                    style={styles.input}
                    placeholder="Description"
                    value={facultyForms[inst.id]?.description || ""}
                    onChange={(e) => setFacultyForms({ ...facultyForms, [inst.id]: { ...facultyForms[inst.id], description: e.target.value } })}
                  />
                  <div style={{ marginTop: 8 }}>
                    <button className="glass-button" onClick={() => handleAddFaculty(inst.id)}>Save Faculty</button>
                  </div>
                </div>
              )}
            </div>

            {/* Courses */}
            <div style={styles.section}>
              <h3 style={{ fontWeight: "600" }}>Courses</h3>
              {inst.courses.length === 0 ? <p>No courses</p> : (
                <ul>
                  {inst.courses.map(course => <li key={course.id}>{course.name}</li>)}
                </ul>
              )}

              {/* Add Course button */}
              <div style={{ marginTop: 12 }}>
                <button
                  className="glass-button"
                  onClick={() => setShowCourseForm({ ...showCourseForm, [inst.id]: !showCourseForm[inst.id] })}
                >
                  {showCourseForm[inst.id] ? 'Cancel' : 'Add Course'}
                </button>
              </div>

              {/* Course form - toggled */}
              {showCourseForm[inst.id] && (
                <div style={{ marginTop: 12 }}>
                  <select
                    style={styles.input}
                    value={courseForms[inst.id]?.facultyId || ""}
                    onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], facultyId: e.target.value } })}
                  >
                    <option value="">Select Faculty</option>
                    {inst.faculties.map(fac => <option key={fac.id} value={fac.id}>{fac.name}</option>)}
                  </select>
                  <input
                    style={styles.input}
                    placeholder="Course Name"
                    value={courseForms[inst.id]?.name || ""}
                    onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], name: e.target.value } })}
                  />
                  <input
                    style={styles.input}
                    placeholder="Duration (e.g., 3 years)"
                    value={courseForms[inst.id]?.duration || ""}
                    onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], duration: e.target.value } })}
                  />
                  <input
                    style={styles.input}
                    placeholder="Requirements"
                    value={courseForms[inst.id]?.requirements || ""}
                    onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], requirements: e.target.value } })}
                  />
                  <div style={{ marginTop: 8 }}>
                    <button className="glass-button" onClick={() => handleAddCourse(inst.id)}>Save Course</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
