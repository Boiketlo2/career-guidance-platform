import { db, auth } from "../utils/firebase.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendCompanyApprovalEmail } from "../utils/emailService.js";

// ---------------------
// Register a new company
// ---------------------
export const registerCompany = asyncHandler(async (req, res) => {
  const { name, email, password, industry, website, description, location, contactPerson, phone } = req.body;

  // Check if company already exists
  const existing = await db.collection("companies").where("email", "==", email).get();
  if (!existing.empty) return res.status(400).json({ success: false, error: "Company with this email already exists" });

  // Create user in Firebase Auth
  const userRecord = await auth.createUser({ 
    email, 
    password, 
    displayName: name, 
    emailVerified: false 
  });

  const companyData = {
    name,
    email,
    industry: industry || "",
    website: website || "",
    description: description || "",
    location: location || "",
    contactPerson: contactPerson || "",
    phone: phone || "",
    authUserId: userRecord.uid,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.collection("companies").doc(userRecord.uid).set(companyData);

  // Mirror in users collection
  await db.collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    role: "company",
    companyName: name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailVerified: false
  });

  res.status(201).json({
    success: true,
    message: "Company registered successfully. Awaiting admin approval.",
    company: { uid: userRecord.uid, ...companyData }
  });
});

// ---------------------
// Post a new job
// ---------------------
export const postJob = asyncHandler(async (req, res) => {
  const { 
    companyId, 
    title, 
    description, 
    requirements, 
    qualifications, 
    location, 
    salaryRange, 
    jobType, 
    applicationDeadline 
  } = req.body;

  const companyDoc = await db.collection("companies").doc(companyId).get();
  if (!companyDoc.exists) return res.status(404).json({ success: false, error: "Company not found" });

  // Log current company status for easier debugging in server logs
  const companyStatus = companyDoc.data().status || "unknown";
  console.log(`postJob: companyId=${companyId} status=${companyStatus} requester=${req.user?.uid || 'anonymous'}`);

  // Authorization: if a requester is present, ensure they are the company owner (or admin in future)
  if (req.user && req.user.role === "company" && req.user.uid !== companyId) {
    return res.status(403).json({ success: false, error: "Forbidden: cannot post jobs for another company" });
  }

  if (companyStatus !== "approved") {
    return res.status(403).json({ success: false, error: "Company not approved to post jobs" });
  }

  const jobData = {
    title,
    description,
    requirements: Array.isArray(requirements) ? requirements : [],
    qualifications: Array.isArray(qualifications) ? qualifications : [],
    location,
    salaryRange: salaryRange || {},
    jobType: jobType || "full-time",
    companyId,
    companyName: companyDoc.data().name,
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
    status: "active",
    applicants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const jobRef = await db.collection("jobs").add(jobData);

  // Also add to company's jobPosts subcollection
  await db.collection("companies").doc(companyId).collection("jobPosts").doc(jobRef.id).set(jobData);

  res.status(201).json({ 
    success: true, 
    message: "Job posted successfully", 
    job: { id: jobRef.id, ...jobData } 
  });
});

// ---------------------
// Get jobs by company
// ---------------------
export const getJobsByCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const companyDoc = await db.collection("companies").doc(companyId).get();
  if (!companyDoc.exists) return res.status(404).json({ success: false, error: "Company not found" });

  const jobsSnapshot = await db.collection("jobs")
    .where("companyId", "==", companyId)
    .orderBy("createdAt", "desc")
    .get();
  
  const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  res.status(200).json({ success: true, count: jobs.length, jobs });
});

// ---------------------
// Get job applicants
// ---------------------
export const getJobApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const jobDoc = await db.collection("jobs").doc(jobId).get();
  if (!jobDoc.exists) return res.status(404).json({ success: false, error: "Job not found" });

  const applicants = jobDoc.data().applicants || [];
  
  // Get detailed applicant information
  const applicantDetails = await Promise.all(
    applicants.map(async (applicantId) => {
      try {
        const studentDoc = await db.collection("students").doc(applicantId).get();
        if (studentDoc.exists) {
          return { 
            id: applicantId, 
            ...studentDoc.data(),
            applicationStatus: "applied"
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching student ${applicantId}:`, error);
        return null;
      }
    })
  );

  const validApplicants = applicantDetails.filter(a => a !== null);

  res.status(200).json({ 
    success: true, 
    count: validApplicants.length, 
    applicants: validApplicants 
  });
});

// ---------------------
// Update applicant status
// ---------------------
export const updateApplicantStatus = asyncHandler(async (req, res) => {
  const { jobId, applicantId } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: "Status is required" });
  }

  const jobRef = db.collection("jobs").doc(jobId);
  const jobDoc = await jobRef.get();
  
  if (!jobDoc.exists) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }

  // Update applicant status in the job document
  const jobData = jobDoc.data();
  const updatedApplicants = jobData.applicants.map(applicant => 
    applicant === applicantId 
      ? { 
          id: applicantId, 
          status, 
          notes: notes || "", 
          updatedAt: new Date().toISOString() 
        }
      : applicant
  );

  await jobRef.update({ 
    applicants: updatedApplicants, 
    updatedAt: new Date().toISOString() 
  });

  // Also update in company's jobPosts subcollection
  const companyJobRef = db.collection("companies")
    .doc(jobData.companyId)
    .collection("jobPosts")
    .doc(jobId);
  
  await companyJobRef.update({
    applicants: updatedApplicants,
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({ 
    success: true, 
    message: "Applicant status updated successfully" 
  });
});

// ---------------------
// Update company profile
// ---------------------
export const updateCompanyProfile = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const updateData = { 
    ...req.body, 
    updatedAt: new Date().toISOString() 
  };

  const companyRef = db.collection("companies").doc(companyId);
  const companyDoc = await companyRef.get();
  
  if (!companyDoc.exists) {
    return res.status(404).json({ success: false, error: "Company not found" });
  }

  await companyRef.update(updateData);
  
  // Also update in users collection
  await db.collection("users").doc(companyId).update(updateData);

  res.status(200).json({ 
    success: true, 
    message: "Company profile updated successfully" 
  });
});

// ---------------------
// Get company profile
// ---------------------
export const getCompanyProfile = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const companyDoc = await db.collection("companies").doc(companyId).get();
  
  if (!companyDoc.exists) {
    return res.status(404).json({ success: false, error: "Company not found" });
  }

  res.status(200).json({ 
    success: true, 
    company: { id: companyDoc.id, ...companyDoc.data() } 
  });
});

// ---------------------
// Get company job posts
// ---------------------
export const getCompanyJobPosts = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  
  const companyDoc = await db.collection("companies").doc(companyId).get();
  if (!companyDoc.exists) {
    return res.status(404).json({ success: false, error: "Company not found" });
  }

  const jobPostsSnapshot = await db.collection("companies")
    .doc(companyId)
    .collection("jobPosts")
    .orderBy("createdAt", "desc")
    .get();
  
  const jobPosts = jobPostsSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));

  res.status(200).json({ 
    success: true, 
    count: jobPosts.length, 
    jobPosts 
  });
});

// ---------------------
// Get all companies (for testing)
// ---------------------
export const getAllCompanies = asyncHandler(async (req, res) => {
  const companiesSnapshot = await db.collection("companies").get();
  const companies = companiesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  res.status(200).json({ 
    success: true, 
    count: companies.length, 
    companies 
  });
});

// ---------------------
// Delete company (for testing cleanup)
// ---------------------
export const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const companyDoc = await db.collection("companies").doc(companyId).get();
  if (!companyDoc.exists) {
    return res.status(404).json({ success: false, error: "Company not found" });
  }

  // Delete from companies collection
  await db.collection("companies").doc(companyId).delete();
  
  // Delete from users collection
  await db.collection("users").doc(companyId).delete();
  
  // Delete from Firebase Auth
  try {
    await auth.deleteUser(companyId);
  } catch (error) {
    console.log("Note: Could not delete from Auth (might not exist)");
  }

  res.status(200).json({ 
    success: true, 
    message: "Company deleted successfully" 
  });
});