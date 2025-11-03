import React, { useEffect, useState } from "react";
import { getInstitutions, getCourses, applyCourse } from "../../api/studentApi";

export default function ApplyCourse() {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    getInstitutions()
      .then((res) => setInstitutions(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleInstitutionChange = (e) => {
    setSelectedInstitution(e.target.value);
    getCourses(e.target.value)
      .then((res) => setCourses(res.data))
      .catch((err) => console.error(err));
  };

  const handleApply = () => {
    const studentId = prompt("Enter your UID:"); // replace with auth context
    applyCourse({ uid: studentId, courseId: selectedCourse, institutionId: selectedInstitution })
      .then(() => alert("Applied successfully"))
      .catch((err) => alert(err.response.data.message || err.message));
  };

  return (
    <div>
      <h1>Apply for Course</h1>
      <select value={selectedInstitution} onChange={handleInstitutionChange}>
        <option value="">Select Institution</option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.id}>{inst.name}</option>
        ))}
      </select>

      {courses.length > 0 && (
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      )}

      <button onClick={handleApply}>Apply</button>
    </div>
  );
}
