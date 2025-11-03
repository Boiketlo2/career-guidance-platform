import express from "express";
import {
  registerCompany,
  postJob,
  getJobsByCompany,
  viewApplicants,
  sendFeedback,
  updateCompanyProfile,
} from "../controllers/companyController.js";

const router = express.Router();

// 🔹 Register new company
router.post("/register", registerCompany);

// 🔹 Post a new job (✅ fixed route to match frontend)
router.post("/jobs", postJob);

// 🔹 Get all jobs posted by a company
router.get("/jobs/:companyId", getJobsByCompany);

// 🔹 View qualified applicants
router.get("/applicants/:companyId", viewApplicants);

// 🔹 Send feedback
router.post("/feedback", sendFeedback);

// 🔹 Update company profile
router.put("/update/:companyId", updateCompanyProfile);

export default router;
