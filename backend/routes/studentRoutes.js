import express from "express";
import multer from "multer";
import {
  registerStudent,
  applyForCourse,
  uploadDocument,
  getAdmissionResults,
  getInstitutionsWithCourses,
  getCoursesByInstitution,
  getAllJobs,
} from "../controllers/studentController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Register new student
router.post("/register", registerStudent);

// 🔹 Apply for a course
router.post("/apply", applyForCourse);

// 🔹 Upload transcript/document
router.post("/upload", upload.single("file"), uploadDocument);

// 🔹 Get admission results
router.get("/results/:uid", getAdmissionResults);

// 🔹 Get all institutions with courses
router.get("/institutions-with-courses", getInstitutionsWithCourses);

// 🔹 Get courses for a specific institution
router.get("/courses/:institutionId", getCoursesByInstitution);

// 🔹 Get all available jobs
router.get("/jobs", getAllJobs);

export default router;
