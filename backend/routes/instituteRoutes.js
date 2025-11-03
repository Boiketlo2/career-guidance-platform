// routes/instituteRoutes.js
import express from "express";
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

// Authentication
router.post("/register", registerInstitute);
router.post("/login", loginInstitute);

// Profile management
router.get("/:institutionId/profile", getInstituteProfile);
router.put("/:institutionId/profile", updateProfile);

// Faculty management
router.get("/:institutionId/faculties", getFaculties);
router.post("/:institutionId/faculties", addFaculty);

// Course management
router.get("/:institutionId/courses", getCourses);
router.post("/:institutionId/courses", addCourse);

// Applications management
router.get("/:institutionId/applications", getApplications);
router.put("/applications/:applicationId", updateAdmissionStatus);

// Admissions
router.get("/:institutionId/admissions", getAdmissions);
router.post("/:institutionId/admissions", publishAdmissions);

export default router;