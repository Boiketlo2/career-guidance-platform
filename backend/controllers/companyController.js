import { db } from "../utils/firebase.js";

// ------------------------
// COMPANY CONTROLLER
// ------------------------

// 🔹 Register a new company (store in "users" with role: company)
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email already exists
    const existing = await db.collection("users").where("email", "==", email).get();
    if (!existing.empty) {
      return res.status(400).json({ message: "Company already registered." });
    }

    const newCompanyRef = db.collection("users").doc();
    await newCompanyRef.set({
      name,
      email,
      password,
      role: "company",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Company registered successfully",
      uid: newCompanyRef.id,
    });
  } catch (error) {
    console.error("❌ Error registering company:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Post a job under the company's subcollection
export const postJob = async (req, res) => {
  try {
    const { companyId, title, description, requirements, deadline } = req.body;

    if (!companyId || !title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const companyRef = db.collection("users").doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return res.status(404).json({ message: "Company not found" });
    }

    // 🔹 Ensure requirements is always stored as an array
    const formattedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === "string"
      ? requirements.split(",").map((r) => r.trim())
      : [];

    const jobRef = await companyRef.collection("jobPosts").add({
      title,
      description,
      requirements: formattedRequirements,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Job posted successfully",
      jobId: jobRef.id,
    });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get all jobs by company
export const getJobsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const companyRef = db.collection("users").doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return res.status(404).json({ message: "Company not found" });
    }

    const jobSnap = await companyRef.collection("jobPosts").get();
    const jobs = jobSnap.docs.map((doc) => ({
      id: doc.id,
      companyId,
      companyName: companyDoc.data().name,
      ...doc.data(),
    }));

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Keep existing placeholder functions
export const viewApplicants = async (req, res) => {
  /* keep your existing code here */
};
export const sendFeedback = async (req, res) => {
  /* keep your existing code here */
};
export const updateCompanyProfile = async (req, res) => {
  /* keep your existing code here */
};
