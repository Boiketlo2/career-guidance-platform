import { db } from "../utils/firebase.js";

// ------------------------
// STUDENT CONTROLLER
// ------------------------

// 🔹 Register a new student
export const registerStudent = async (req, res) => {
  try {
    const { uid, name, email, institution, program } = req.body;

    await db.collection("users").doc(uid).set({
      role: "student",
      name,
      email,
      institution,
      program,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("❌ Error registering student:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Apply for a course (limit: 2 per student)
export const applyForCourse = async (req, res) => {
  try {
    const { uid, courseId, institutionId } = req.body;
    const applicationsRef = db.collection("applications");

    const studentApps = await applicationsRef.where("studentId", "==", uid).get();
    if (studentApps.size >= 2)
      return res.status(400).json({ message: "You can only apply for 2 courses" });

    await applicationsRef.add({
      studentId: uid,
      courseId,
      institutionId,
      status: "pending",
      appliedAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("❌ Error applying for course:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Upload student document (mock safe version)
export const uploadDocument = async (req, res) => {
  try {
    const { uid } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ message: "Student not found" });

    const fakeUrl = `https://fake-storage.local/students/${uid}/${file.originalname}`;
    await userRef.update({
      transcriptUrl: fakeUrl,
      documentName: file.originalname,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: "File uploaded successfully (mock mode, no Firebase Storage)",
      fileUrl: fakeUrl,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get admission results
export const getAdmissionResults = async (req, res) => {
  try {
    const { uid } = req.params;
    const resultsRef = db.collection("applications").where("studentId", "==", uid);
    const snapshot = await resultsRef.get();

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get all institutions with faculties and courses
export const getInstitutionsWithCourses = async (req, res) => {
  try {
    const institutionsSnap = await db.collection("institutions").get();
    const institutions = [];

    for (const instDoc of institutionsSnap.docs) {
      const instData = instDoc.data();

      // Fetch faculties for this institution
      const facultiesSnap = await db
        .collection("faculties")
        .where("institutionId", "==", instDoc.id)
        .get();

      const faculties = [];
      for (const facDoc of facultiesSnap.docs) {
        const facData = facDoc.data();

        // Fetch courses for this faculty
        const coursesSnap = await db
          .collection("courses")
          .where("facultyId", "==", facDoc.id)
          .get();

        const courses = coursesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        faculties.push({
          id: facDoc.id,
          ...facData,
          courses,
        });
      }

      institutions.push({
        id: instDoc.id,
        ...instData,
        faculties,
      });
    }

    res.status(200).json(institutions);
  } catch (error) {
    console.error("❌ Error fetching institutions with courses:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get courses by institutionId
export const getCoursesByInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;

    // Fetch faculties for this institution
    const facultiesSnap = await db
      .collection("faculties")
      .where("institutionId", "==", institutionId)
      .get();

    const courses = [];
    for (const facDoc of facultiesSnap.docs) {
      const coursesSnap = await db
        .collection("courses")
        .where("facultyId", "==", facDoc.id)
        .get();

      courses.push(
        ...coursesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          faculty: facDoc.data().name,
        }))
      );
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get all job posts (from subcollections)
export const getAllJobs = async (req, res) => {
  try {
    const companiesSnap = await db.collection("companies").get();
    const allJobs = [];

    for (const companyDoc of companiesSnap.docs) {
      const companyData = companyDoc.data();

      const jobPostsSnap = await db
        .collection("companies")
        .doc(companyDoc.id)
        .collection("jobPosts")
        .get();

      jobPostsSnap.forEach((jobDoc) => {
        allJobs.push({
          id: jobDoc.id,
          companyId: companyDoc.id,
          companyName: companyData.name || "Unknown Company",
          ...jobDoc.data(),
        });
      });
    }

    res.status(200).json(allJobs);
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
};
