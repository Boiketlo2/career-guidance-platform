// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import InstituteRegister from "./pages/institute/Register";
import InstituteLogin from "./pages/institute/Login";

// Pages
import Dashboard from "./pages/institute/Dashboard";
import Faculties from "./pages/institute/Faculties";
import Courses from "./pages/institute/Courses";
import Applications from "./pages/institute/Applications";
import PublishAdmissions from "./pages/institute/PublishAdmissions";
import Profile from "./pages/institute/Profile";
import AddInstitution from "./pages/institute/AddInstitution";
import AddFaculty from "./pages/institute/AddFaculty";
import AddCourse from "./pages/institute/AddCourse";
import InstitutionsDirectory from "./pages/institute/InstitutionsDirectory"; // Corrected path

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/institutions" />} />

          {/* Public Routes */}
          <Route path="/institutions" element={<InstitutionsDirectory />} />

          {/* Institute Routes */}
          <Route path="/institutes/:institutionId/dashboard" element={<Dashboard />} />
          <Route path="/institutes/:institutionId/faculties" element={<FacultiesWrapper />} />
          <Route path="/institutes/:institutionId/faculties/add" element={<AddFaculty />} />
          <Route path="/institutes/:institutionId/courses" element={<CoursesWrapper />} />
          <Route path="/institutes/:institutionId/courses/add" element={<AddCourse />} />
          <Route path="/institutes/:institutionId/applications" element={<ApplicationsWrapper />} />
          <Route path="/institutes/:institutionId/publish-admissions" element={<PublishAdmissionsWrapper />} />
          <Route path="/institutes/:institutionId/profile" element={<ProfileWrapper />} />
          
          {/* Authentication Routes */}
          <Route path="/institute/register" element={<InstituteRegister />} />
          <Route path="/institute/login" element={<InstituteLogin />} />
          
          {/* Admin Routes */}
          <Route path="/add-institution" element={<AddInstitution />} />

          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </div>
    </Router>
  );
}

// 🔹 Wrappers (keep your existing wrapper code)
const FacultiesWrapper = () => {
  const { institutionId } = useParams();
  return <Faculties institutionId={institutionId} />;
};

const CoursesWrapper = () => {
  const { institutionId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch all courses
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const allCourses = coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        // Fetch all faculties for this institution to filter courses
        const facultiesSnapshot = await getDocs(collection(db, "faculties"));
        const institutionFaculties = facultiesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(faculty => faculty.institutionId === institutionId);
        
        // Filter courses that belong to faculties of this institution
        const institutionCourses = allCourses.filter(course => {
          const faculty = institutionFaculties.find(f => f.id === course.facultyId);
          return faculty !== undefined;
        }).map(course => {
          const faculty = institutionFaculties.find(f => f.id === course.facultyId);
          return {
            ...course,
            facultyName: faculty ? faculty.name : "Unknown Faculty"
          };
        });

        setCourses(institutionCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [institutionId]);

  if (loading) return <p>Loading courses...</p>;
  return <Courses courses={courses} />;
};

const ApplicationsWrapper = () => {
  const { institutionId } = useParams();
  return <Applications institutionId={institutionId} />;
};

const PublishAdmissionsWrapper = () => {
  const { institutionId } = useParams();
  return <PublishAdmissions institutionId={institutionId} />;
};

const ProfileWrapper = () => {
  const { institutionId } = useParams();
  return <Profile institutionId={institutionId} />;
};

export default App;