import express from "express";
import { isCompany } from "../middleware/auth.js";
import {
  registerCompany,
  postJob,
  getJobsByCompany,
  getJobApplicants,
  updateApplicantStatus,
  updateCompanyProfile,
  getCompanyProfile,
  getCompanyJobPosts,
  getAllCompanies,
  deleteCompany
} from "../controllers/companyController.js";

const router = express.Router();

// Public routes (no authentication required for testing)
router.post("/register", registerCompany);
// Protected: only authenticated company users may post jobs
router.post("/jobs", isCompany, postJob);
router.get("/jobs/company/:companyId", getJobsByCompany);
router.get("/jobs/:jobId/applicants", getJobApplicants);
router.patch("/jobs/:jobId/applicants/:applicantId", updateApplicantStatus);
router.get("/profile/:companyId", getCompanyProfile);
router.put("/profile/:companyId", updateCompanyProfile);
router.get("/:companyId/job-posts", getCompanyJobPosts);
router.get("/", getAllCompanies);
router.delete("/:companyId", deleteCompany);

export default router;