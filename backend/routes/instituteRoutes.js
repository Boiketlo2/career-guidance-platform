import express from "express";
import { isInstitution } from "../middleware/auth.js";
import {
  registerInstitute,
  loginInstitute,
  addFaculty,
  addCourse,
  getApplications,
  updateAdmissionStatus,
  publishAdmissions,
  updateProfile,
  getInstituteProfile,
  getFaculties,
  getCourses,
  getAdmissions
} from "../controllers/instituteController.js";

const router = express.Router();

// ---------------------
// Public Routes
// ---------------------
router.post("/register", registerInstitute);
router.post("/login", loginInstitute);

// ---------------------
// Protected Routes
// ---------------------
router.use(isInstitution); // All routes below require institution auth

// Profile Management
router.get("/:institutionId/profile", getInstituteProfile);
router.put("/:institutionId/profile", updateProfile);

// Faculty Management
router.get("/:institutionId/faculties", getFaculties);
router.post("/:institutionId/faculties", addFaculty);

// Course Management
router.get("/:institutionId/courses", getCourses);
router.post("/:institutionId/courses", addCourse);

// Applications Management
router.get("/:institutionId/applications", getApplications);
router.patch("/applications/:applicationId", updateAdmissionStatus);

// Admissions
router.get("/:institutionId/admissions", getAdmissions);
router.post("/:institutionId/admissions", publishAdmissions);

export default router;