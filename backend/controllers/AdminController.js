import { db, admin } from "../config/Firebase.js";

// ✅ Admin Login
export const login = async (req, res) => {
  res.status(200).json({ message: "Admin login successful" });
};

// ✅ Helper: fetch collection data sorted by createdAt
const getCollectionData = async (collectionName, orderByField = "createdAt") => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

// --------------------- Institutions ---------------------
export const getInstitutions = async (req, res) => {
  try {
    const institutions = await getCollectionData("institutions");
    res.status(200).json({ count: institutions.length, institutions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch institutions" });
  }
};

export const addInstitution = async (req, res) => {
  try {
    const { name, location, type, description } = req.body;
    if (!name || !location || !type)
      return res.status(400).json({ error: "Missing required fields" });

    const ref = await db.collection("institutions").add({
      name,
      location,
      type,
      description: description || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: ref.id, message: "Institution added successfully" });
  } catch (error) {
    console.error("Error adding institution:", error);
    res.status(500).json({ error: "Failed to add institution" });
  }
};

export const updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("institutions").doc(id).update(req.body);
    res.status(200).json({ message: "Institution updated successfully" });
  } catch (error) {
    console.error("Error updating institution:", error);
    res.status(500).json({ error: "Failed to update institution" });
  }
};

export const deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("institutions").doc(id).delete();
    res.status(200).json({ message: "Institution deleted successfully" });
  } catch (error) {
    console.error("Error deleting institution:", error);
    res.status(500).json({ error: "Failed to delete institution" });
  }
};

// --------------------- Faculties ---------------------
export const getFacultiesByInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db
      .collection("faculties")
      .where("institutionId", "==", id)
      .get();

    const faculties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ count: faculties.length, faculties });
  } catch (err) {
    console.error("Error fetching faculties:", err);
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

export const addFaculty = async (req, res) => {
  try {
    const { id } = req.params; // institutionId
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Faculty name is required" });

    const ref = await db.collection("faculties").add({
      name,
      institutionId: id,
      courses: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: ref.id, message: "Faculty added successfully" });
  } catch (error) {
    console.error("Error adding faculty:", error);
    res.status(500).json({ error: "Failed to add faculty" });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("faculties").doc(id).delete();
    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Error deleting faculty:", error);
    res.status(500).json({ error: "Failed to delete faculty" });
  }
};

// --------------------- Courses ---------------------
export const addCourseToFaculty = async (req, res) => {
  try {
    const { id } = req.params; // facultyId
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Course name is required" });

    const facultyRef = db.collection("faculties").doc(id);
    const facultySnap = await facultyRef.get();
    if (!facultySnap.exists) return res.status(404).json({ error: "Faculty not found" });

    const courseRef = await db.collection("courses").add({
      name,
      facultyId: id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await facultyRef.update({
      courses: admin.firestore.FieldValue.arrayUnion({ id: courseRef.id, name }),
    });

    res.status(201).json({ id: courseRef.id, message: "Course added successfully" });
  } catch (error) {
    console.error("Error adding course to faculty:", error);
    res.status(500).json({ error: "Failed to add course" });
  }
};

export const deleteCourseFromFaculty = async (req, res) => {
  try {
    const { facultyId, courseId } = req.params;

    const facultyRef = db.collection("faculties").doc(facultyId);
    const facultySnap = await facultyRef.get();
    if (!facultySnap.exists) return res.status(404).json({ error: "Faculty not found" });

    const courseRef = db.collection("courses").doc(courseId);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) return res.status(404).json({ error: "Course not found" });

    await courseRef.delete();

    const courseData = courseSnap.data();
    await facultyRef.update({
      courses: admin.firestore.FieldValue.arrayRemove({ id: courseId, name: courseData.name }),
    });

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course from faculty:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

// --------------------- Companies ---------------------
export const getCompanies = async (req, res) => {
  try {
    const companies = await getCollectionData("companies");
    res.status(200).json({ count: companies.length, companies });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

export const approveCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);

    const docRef = db.collection("companies").doc(decodedId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      await docRef.update({ approved: true, status: "Approved" });
      return res.status(200).json({ message: "Company approved successfully (by ID)" });
    }

    const nameQuery = await db.collection("companies").where("name", "==", decodedId).get();
    if (nameQuery.empty) return res.status(404).json({ error: "Company not found" });

    const companyDoc = nameQuery.docs[0];
    await db.collection("companies").doc(companyDoc.id).update({ approved: true, status: "Approved" });

    res.status(200).json({ message: "Company approved successfully (by name)" });
  } catch (error) {
    console.error("Error approving company:", error);
    res.status(500).json({ error: "Failed to approve company" });
  }
};

export const suspendCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);

    const docRef = db.collection("companies").doc(decodedId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      await docRef.update({ approved: false, status: "Suspended" });
      return res.status(200).json({ message: "Company suspended successfully (by ID)" });
    }

    const nameQuery = await db.collection("companies").where("name", "==", decodedId).get();
    if (nameQuery.empty) return res.status(404).json({ error: "Company not found" });

    const companyDoc = nameQuery.docs[0];
    await db.collection("companies").doc(companyDoc.id).update({ approved: false, status: "Suspended" });

    res.status(200).json({ message: "Company suspended successfully (by name)" });
  } catch (error) {
    console.error("Error suspending company:", error);
    res.status(500).json({ error: "Failed to suspend company" });
  }
};

// --------------------- Users ---------------------
export const getUsers = async (req, res) => {
  try {
    const users = await getCollectionData("users");
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = db.collection("users").doc(id);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

    await userRef.delete();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// --------------------- Admissions ---------------------
export const getAdmissions = async (req, res) => {
  try {
    const admissions = await getCollectionData("admissions");
    res.status(200).json({ count: admissions.length, admissions });
  } catch (error) {
    console.error("Error fetching admissions:", error);
    res.status(500).json({ error: "Failed to fetch admissions" });
  }
};

export const publishAdmissions = async (req, res) => {
  try {
    const { admissionIds } = req.body;
    if (!admissionIds || !admissionIds.length) return res.status(400).json({ error: "No admission IDs provided" });

    const batch = db.batch();
    admissionIds.forEach((id) => {
      const ref = db.collection("admissions").doc(id);
      batch.update(ref, { published: true });
    });
    await batch.commit();

    res.status(200).json({ message: "Admissions published successfully" });
  } catch (error) {
    console.error("Error publishing admissions:", error);
    res.status(500).json({ error: "Failed to publish admissions" });
  }
};

// --------------------- Reports ---------------------
export const reportsSummary = async (req, res) => {
  try {
    const institutions = await db.collection("institutions").get();
    const companies = await db.collection("companies").get();
    const users = await db.collection("users").get();
    const admissions = await db.collection("admissions").get();

    res.status(200).json({
      totalInstitutions: institutions.size,
      totalCompanies: companies.size,
      totalUsers: users.size,
      totalAdmissions: admissions.size,
    });
  } catch (error) {
    console.error("Error fetching report summary:", error);
    res.status(500).json({ error: "Failed to fetch report summary" });
  }
};
