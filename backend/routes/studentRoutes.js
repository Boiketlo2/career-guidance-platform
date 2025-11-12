import express from "express";
import multer from "multer";

import {
  getInstitutionsWithCourses,
  getCoursesByInstitution,
  applyForCourse,
  uploadDocument,
  getAdmissionResults,
  getAllJobs,
  applyForJob,
  getStudentProfile,
  updateStudentProfile,
  addWorkExperience,
  getStudentApplications,
  getStudentDocuments,
  getStudentJobApplications,
  // New functions for academic records and qualified courses
  saveStudentSubjects,
  getStudentSubjects,
  getPredefinedSubjects,
  getQualifiedCourses,
} from "../controllers/studentController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Public routes - NO AUTHENTICATION REQUIRED
router.get("/institutions", getInstitutionsWithCourses);
router.get("/courses/:institutionId", getCoursesByInstitution);

// Profile
router.get("/profile/:studentId", getStudentProfile);
router.put("/profile/:studentId", updateStudentProfile);

// Course Applications
router.post("/apply-course", applyForCourse);
router.get("/applications/:studentId", getStudentApplications);
router.get("/results/:studentId", getAdmissionResults);

// Documents
router.post("/upload-document", upload.single("file"), uploadDocument);
router.get("/documents/:studentId", getStudentDocuments);

// Work Experience
router.post("/work-experience/:studentId", addWorkExperience);

// Jobs
router.get("/jobs", getAllJobs);
router.post("/apply-job", applyForJob);
router.get("/job-applications/:studentId", getStudentJobApplications);

// 🔹 NEW ROUTES: Academic Records and Qualified Courses
router.post("/subjects/:studentId", saveStudentSubjects);
router.get("/subjects/:studentId", getStudentSubjects);
router.get("/subjects-list/predefined", getPredefinedSubjects);
router.get("/qualified-courses/:studentId", getQualifiedCourses);

export default router;
