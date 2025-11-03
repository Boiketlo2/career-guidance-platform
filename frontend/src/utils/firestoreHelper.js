// src/utils/firestoreHelpers.js
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// 🔹 Fetch all institutions
export const fetchInstitutions = async () => {
  try {
    const institutionsSnapshot = await getDocs(collection(db, "institutions"));
    return institutionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return [];
  }
};

// 🔹 Fetch institution by ID
export const fetchInstitutionById = async (institutionId) => {
  try {
    const institutionDoc = await getDoc(doc(db, "institutions", institutionId));
    if (institutionDoc.exists()) {
      return {
        id: institutionDoc.id,
        ...institutionDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching institution:", error);
    return null;
  }
};

// 🔹 Fetch faculties for an institution
export const fetchFaculties = async (institutionId) => {
  try {
    const facultiesSnapshot = await getDocs(collection(db, "faculties"));
    const faculties = facultiesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(faculty => faculty.institutionId === institutionId);
    
    return faculties;
  } catch (error) {
    console.error("Error fetching faculties:", error);
    return [];
  }
};

// 🔹 Fetch courses for a faculty
export const fetchCourses = async (facultyId) => {
  try {
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const courses = coursesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(course => course.facultyId === facultyId);
    
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

// 🔹 Fetch all courses for an institution
export const fetchInstitutionCourses = async (institutionId) => {
  try {
    // First get all faculties for this institution
    const faculties = await fetchFaculties(institutionId);
    
    // Then get all courses for each faculty
    const allCourses = [];
    for (const faculty of faculties) {
      const facultyCourses = await fetchCourses(faculty.id);
      allCourses.push(...facultyCourses.map(course => ({
        ...course,
        facultyName: faculty.name
      })));
    }
    
    return allCourses;
  } catch (error) {
    console.error("Error fetching institution courses:", error);
    return [];
  }
};

// 🔹 Fetch applications for an institution
export const fetchApplications = async (institutionId) => {
  try {
    const applicationsSnapshot = await getDocs(collection(db, "applications"));
    const applications = applicationsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(app => app.institutionId === institutionId);
    
    return applications;
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
};

// 🔹 Fetch companies
export const fetchCompanies = async () => {
  try {
    const companiesSnapshot = await getDocs(collection(db, "companies"));
    return companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

// 🔹 Fetch jobs
export const fetchJobs = async () => {
  try {
    const jobsSnapshot = await getDocs(collection(db, "jobs"));
    return jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};