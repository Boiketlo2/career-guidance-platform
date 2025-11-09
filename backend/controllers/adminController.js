import { db, auth } from "../utils/firebase.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { 
  validateInstitution, 
  validateFaculty, 
  validateCourse,
  validateId 
} from "../middleware/validation.js";

// ---------------------
// Admin Login
// ---------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password are required" 
    });
  }

  try {
    // Simulated login for admin; in production, use Firebase Auth
    res.status(200).json({ 
      success: true,
      message: "Admin login successful",
      user: {
        uid: "admin-uid",
        email,
        role: "admin",
        name: "Administrator"
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
});

// ---------------------
// Helper: Fetch collection data
// ---------------------
const getCollectionData = async (collectionName, orderByField = "createdAt") => {
  const snapshot = await db.collection(collectionName)
    .orderBy(orderByField, "desc")
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ---------------------
// Institutions
// ---------------------
export const getInstitutions = asyncHandler(async (req, res) => {
  const institutions = await getCollectionData("institutions");
  res.status(200).json({ success: true, count: institutions.length, institutions });
});

export const addInstitution = [validateInstitution, asyncHandler(async (req, res) => {
  const { name, location, type, description, email, website, contactEmail } = req.body;

  const existing = await db.collection("institutions").where("name", "==", name).get();
  if (!existing.empty) return res.status(400).json({ success: false, error: "Institution with this name already exists" });

  const data = { name, location, type, description: description || "", email: email || "", website: website || "", contactEmail: contactEmail || "", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const ref = await db.collection("institutions").add(data);

  res.status(201).json({ success: true, message: "Institution added successfully", institution: { id: ref.id, ...data } });
})];

export const updateInstitution = [validateId, validateInstitution, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ref = db.collection("institutions").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  const updatedData = { ...req.body, updatedAt: new Date().toISOString() };
  await ref.update(updatedData);
  res.status(200).json({ success: true, message: "Institution updated successfully", institution: { id, ...updatedData } });
})];

export const deleteInstitution = [validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ref = db.collection("institutions").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  await ref.delete();
  res.status(200).json({ success: true, message: "Institution deleted successfully" });
})];

// ---------------------
// Faculties
// ---------------------
export const getFacultiesByInstitution = [validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const institution = await db.collection("institutions").doc(id).get();
  if (!institution.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  const snapshot = await db.collection("faculties").where("institutionId", "==", id).orderBy("createdAt", "desc").get();
  const faculties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, count: faculties.length, faculties });
})];

export const addFaculty = [validateId, validateFaculty, asyncHandler(async (req, res) => {
  const { id } = req.params; // institutionId
  const institution = await db.collection("institutions").doc(id).get();
  if (!institution.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  const data = { name: req.body.name, description: req.body.description || "", institutionId: id, courses: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const ref = await db.collection("faculties").add(data);

  res.status(201).json({ success: true, message: "Faculty added successfully", faculty: { id: ref.id, ...data } });
})];

export const deleteFaculty = [validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ref = db.collection("faculties").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ success: false, error: "Faculty not found" });

  if ((doc.data().courses || []).length > 0) return res.status(400).json({ success: false, error: "Cannot delete faculty with existing courses. Delete courses first." });

  await ref.delete();
  res.status(200).json({ success: true, message: "Faculty deleted successfully" });
})];

// ---------------------
// Courses
// ---------------------
export const addCourseToFaculty = [validateId, validateCourse, asyncHandler(async (req, res) => {
  const { id } = req.params; // facultyId
  const facultyRef = db.collection("faculties").doc(id);
  const facultyDoc = await facultyRef.get();
  if (!facultyDoc.exists) return res.status(404).json({ success: false, error: "Faculty not found" });

  const data = { ...req.body, facultyId: id, institutionId: facultyDoc.data().institutionId, status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const courseRef = await db.collection("courses").add(data);

  await facultyRef.update({ courses: [...(facultyDoc.data().courses || []), { id: courseRef.id, name: data.name }], updatedAt: new Date().toISOString() });

  res.status(201).json({ success: true, message: "Course added successfully", course: { id: courseRef.id, ...data } });
})];

export const deleteCourseFromFaculty = [validateId, asyncHandler(async (req, res) => {
  const { facultyId, courseId } = req.params;
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();
  if (!facultyDoc.exists) return res.status(404).json({ success: false, error: "Faculty not found" });

  const courseRef = db.collection("courses").doc(courseId);
  const courseDoc = await courseRef.get();
  if (!courseDoc.exists) return res.status(404).json({ success: false, error: "Course not found" });

  await courseRef.delete();
  const updatedCourses = (facultyDoc.data().courses || []).filter(c => c.id !== courseId);
  await facultyRef.update({ courses: updatedCourses, updatedAt: new Date().toISOString() });

  res.status(200).json({ success: true, message: "Course deleted successfully" });
})];

// ---------------------
// Companies
// ---------------------
export const getCompanies = asyncHandler(async (req, res) => {
  const companies = await getCollectionData("companies");
  res.status(200).json({ success: true, count: companies.length, companies });
});

export const approveCompany = [validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ref = db.collection("companies").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ success: false, error: "Company not found" });

  await ref.update({ status: "approved", approved: true, approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  res.status(200).json({ success: true, message: "Company approved successfully" });
})];

export const suspendCompany = [validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ref = db.collection("companies").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ success: false, error: "Company not found" });

  await ref.update({ status: "suspended", approved: false, suspendedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  res.status(200).json({ success: true, message: "Company suspended successfully" });
})];

export const deleteCompany = [validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ref = db.collection("companies").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ success: false, error: "Company not found" });

  await ref.delete();
  res.status(200).json({ success: true, message: "Company deleted successfully" });
})];

// ---------------------
// Users
// ---------------------
export const getUsers = asyncHandler(async (req, res) => {
  const users = await getCollectionData("users");
  res.status(200).json({ success: true, count: users.length, users });
});

export const deleteUser = [validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ref = db.collection("users").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ success: false, error: "User not found" });

  await ref.delete();
  res.status(200).json({ success: true, message: "User deleted successfully" });
})];

// ---------------------
// Admissions
// ---------------------
export const getAdmissions = asyncHandler(async (req, res) => {
  const admissions = await getCollectionData("admissions");
  res.status(200).json({ success: true, count: admissions.length, admissions });
});

export const publishAdmissions = asyncHandler(async (req, res) => {
  const { title, description, institutionId } = req.body;
  if (!title || !institutionId) return res.status(400).json({ success: false, error: "Title and institution ID are required" });

  const data = { title, description: description || "", institutionId, status: "published", publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() };
  const ref = await db.collection("admissions").add(data);

  res.status(201).json({ success: true, message: "Admissions published successfully", admission: { id: ref.id, ...data } });
});

// ---------------------
// Reports
// ---------------------
export const reportsSummary = asyncHandler(async (req, res) => {
  const [institutionsSnapshot, companiesSnapshot, usersSnapshot, admissionsSnapshot, studentsSnapshot, applicationsSnapshot] = await Promise.all([
    db.collection("institutions").get(),
    db.collection("companies").get(),
    db.collection("users").get(),
    db.collection("admissions").get(),
    db.collection("students").get(),
    db.collection("applications").get()
  ]);

  const approvedCompanies = companiesSnapshot.docs.filter(doc => doc.data().status === "approved").length;
  const pendingCompanies = companiesSnapshot.docs.filter(doc => doc.data().status === "pending").length;
  const publishedAdmissions = admissionsSnapshot.docs.filter(doc => doc.data().status === "published").length;
  const pendingApplications = applicationsSnapshot.docs.filter(doc => doc.data().status === "pending").length;

  res.status(200).json({
    success: true,
    summary: {
      totalInstitutions: institutionsSnapshot.size,
      totalCompanies: companiesSnapshot.size,
      totalUsers: usersSnapshot.size,
      totalStudents: studentsSnapshot.size,
      totalAdmissions: admissionsSnapshot.size,
      totalApplications: applicationsSnapshot.size,
      approvedCompanies,
      pendingCompanies,
      publishedAdmissions,
      pendingApplications
    },
    timestamp: new Date().toISOString()
  });
});

// ---------------------
// Applications
// ---------------------
export const getApplications = asyncHandler(async (req, res) => {
  const applications = await getCollectionData("applications");
  res.status(200).json({ success: true, count: applications.length, applications });
});
