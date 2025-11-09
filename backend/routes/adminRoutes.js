import express from "express";
import { isAdmin } from "../middleware/auth.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// ---------------------
// Public Route
// ---------------------
router.post("/login", adminController.login);

// ---------------------
// Protected Routes (require admin authentication)
// ---------------------
router.use(isAdmin);

// Institutions
router.get("/institutions", adminController.getInstitutions);
router.post("/institutions", adminController.addInstitution);
router.put("/institutions/:id", adminController.updateInstitution);
router.delete("/institutions/:id", adminController.deleteInstitution);

// Faculties
router.get("/institutions/:id/faculties", adminController.getFacultiesByInstitution);
router.post("/institutions/:id/faculties", adminController.addFaculty);
router.delete("/faculties/:id", adminController.deleteFaculty);

// Courses
router.post("/faculties/:id/courses", adminController.addCourseToFaculty);
router.delete("/faculties/:facultyId/courses/:courseId", adminController.deleteCourseFromFaculty);

// Companies
router.get("/companies", adminController.getCompanies);
router.patch("/companies/:id/approve", adminController.approveCompany);
router.patch("/companies/:id/suspend", adminController.suspendCompany);
router.delete("/companies/:id", adminController.deleteCompany);

// Admissions
router.get("/admissions", adminController.getAdmissions);
router.post("/admissions/publish", adminController.publishAdmissions);

// Users
router.get("/users", adminController.getUsers);
router.delete("/users/:id", adminController.deleteUser);

// Applications
router.get("/applications", adminController.getApplications);

// Reports
router.get("/reports/summary", adminController.reportsSummary);

export default router;
