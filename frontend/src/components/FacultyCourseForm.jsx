import React, { useEffect, useState } from "react";

export default function FacultyCourseForm() {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [newFaculty, setNewFaculty] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/admin";

  // ------------------- Fetch Institutions -------------------
  const fetchInstitutions = async () => {
    try {
      const res = await fetch(`${API_URL}/institutions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInstitutions(data.institutions || []);
    } catch (err) {
      console.error("Error fetching institutions:", err);
      setError("Could not load institutions.");
    }
  };

  // ------------------- Fetch Faculties -------------------
  const fetchFaculties = async (institutionId) => {
    if (!institutionId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/institutions/${institutionId}/faculties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFaculties(data.faculties || []);
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError("Could not load faculties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // ------------------- Add Faculty -------------------
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!selectedInstitution || !newFaculty.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/institutions/${selectedInstitution}/faculties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFaculty }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewFaculty("");
      fetchFaculties(selectedInstitution);
    } catch (err) {
      console.error("Add faculty error:", err);
      setError("Failed to add faculty.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Add Course -------------------
  const handleAddCourse = async (facultyId) => {
    if (!facultyId || !newCourse.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/faculties/${facultyId}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCourse }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewCourse("");
      fetchFaculties(selectedInstitution);
    } catch (err) {
      console.error("Add course error:", err);
      setError("Failed to add course.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Delete Faculty -------------------
  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("Delete this faculty?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/faculties/${facultyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchFaculties(selectedInstitution);
    } catch (err) {
      console.error("Delete faculty error:", err);
      setError("Failed to delete faculty.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Delete Course -------------------
  const handleDeleteCourse = async (facultyId, courseId) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/faculties/${facultyId}/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchFaculties(selectedInstitution);
    } catch (err) {
      console.error("Delete course error:", err);
      setError("Failed to delete course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50 text-center">
      <h1 className="text-3xl font-bold mb-6">Manage Faculties & Courses</h1>

      {/* Institution Selector */}
      <div className="mb-6">
        <select
          value={selectedInstitution}
          onChange={(e) => {
            setSelectedInstitution(e.target.value);
            fetchFaculties(e.target.value);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">Select an Institution</option>
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Faculty */}
      {selectedInstitution && (
        <form onSubmit={handleAddFaculty} className="space-y-3 mb-8">
          <input
            type="text"
            placeholder="New Faculty Name"
            value={newFaculty}
            onChange={(e) => setNewFaculty(e.target.value)}
            className="border rounded px-3 py-2 w-64"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Faculty"}
          </button>
        </form>
      )}

      {/* Faculties List */}
      {faculties.length === 0 && selectedInstitution ? (
        <p>No faculties found for this institution.</p>
      ) : (
        faculties.map((faculty) => (
          <div key={faculty.id} className="border bg-white rounded p-5 shadow-md mb-6 max-w-lg mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">{faculty.name}</h2>
              <button
                onClick={() => handleDeleteFaculty(faculty.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete Faculty
              </button>
            </div>

            {/* Courses List */}
            <ul className="mt-3 text-left pl-4">
              {faculty.courses?.map((course) => (
                <li key={course.id} className="flex justify-between">
                  <span>{course.name}</span>
                  <button
                    onClick={() => handleDeleteCourse(faculty.id, course.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            {/* Add Course Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCourse(faculty.id);
              }}
              className="mt-3 flex justify-center gap-3"
            >
              <input
                type="text"
                placeholder="New Course Name"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={loading}
              >
                Add Course
              </button>
            </form>
          </div>
        ))
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
