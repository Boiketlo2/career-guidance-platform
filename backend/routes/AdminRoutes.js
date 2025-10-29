import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import * as adminController from "../controllers/AdminController.js";

const router = express.Router();

// ✅ Public route (admin login)
router.post("/login", adminController.login);

// ✅ Protected routes
router.use(verifyToken);

// --------------------- Institutions ---------------------
router.get("/institutions", adminController.getInstitutions);
router.post("/institutions", adminController.addInstitution);
router.put("/institutions/:id", adminController.updateInstitution);
router.delete("/institutions/:id", adminController.deleteInstitution);

// --------------------- Faculties ---------------------
router.post("/institutions/:id/faculties", adminController.addFaculty);
router.get("/institutions/:id/faculties", adminController.getFacultiesByInstitution);
router.delete("/faculties/:id", adminController.deleteFaculty);

// --------------------- Courses ---------------------
router.post("/faculties/:id/courses", adminController.addCourseToFaculty);
router.delete("/faculties/:facultyId/courses/:courseId", adminController.deleteCourseFromFaculty);

// --------------------- Companies ---------------------
router.get("/companies", adminController.getCompanies);
router.patch("/companies/:id/approve", adminController.approveCompany);
router.patch("/companies/:id/suspend", adminController.suspendCompany);

// --------------------- Admissions ---------------------
router.get("/admissions", adminController.getAdmissions);
router.post("/admissions/publish", adminController.publishAdmissions);

// --------------------- Users ---------------------
router.get("/users", adminController.getUsers);
router.delete("/users/:id", adminController.deleteUser);

// --------------------- Reports ---------------------
router.get("/reports/summary", adminController.reportsSummary);

export default router;
