// controllers/instituteController.js
import { db, auth } from "../utils/firebase.js";

// ✅ Register Institute
export const registerInstitute = async (req, res) => {
  try {
    const { email, password, name, location, contact, website } = req.body;

    const user = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Use "institutions" collection
    await db.collection("institutions").doc(user.uid).set({
      name,
      email,
      location,
      contact,
      website: website || "",
      createdAt: new Date(),
      role: "institute",
      emailVerified: false,
      status: "active"
    });

    res.status(201).json({ 
      message: "Institute registered successfully", 
      uid: user.uid,
      instituteId: user.uid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Login Institute (Fixed - Add this export)
export const loginInstitute = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For backend login, you might want to create a custom token
    // or use Firebase Admin to verify credentials
    const user = await auth.getUserByEmail(email);
    
    // You can create a custom token if needed
    // const customToken = await auth.createCustomToken(user.uid);
    
    res.status(200).json({ 
      message: "Login successful", 
      uid: user.uid,
      email: user.email
      // customToken: customToken // if using custom tokens
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
};

// ✅ Add Faculty
export const addFaculty = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { name, description } = req.body;

    const facultyRef = await db.collection("institutions")
      .doc(institutionId)
      .collection("faculties")
      .add({
        name,
        description,
        createdAt: new Date(),
      });

    res.status(200).json({ 
      message: "Faculty added successfully",
      facultyId: facultyRef.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Add Course
export const addCourse = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { name, facultyId, description, requirements, duration } = req.body;

    const courseRef = await db.collection("institutions")
      .doc(institutionId)
      .collection("courses")
      .add({
        name,
        facultyId,
        description,
        requirements,
        duration,
        createdAt: new Date(),
      });

    res.status(200).json({ 
      message: "Course added successfully",
      courseId: courseRef.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Applications
export const getApplications = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const appsSnapshot = await db.collection("institutions")
      .doc(institutionId)
      .collection("applications")
      .get();

    const applications = appsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Student Status
export const updateAdmissionStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { institutionId, status } = req.body;

    const appRef = db.collection("institutions")
      .doc(institutionId)
      .collection("applications")
      .doc(applicationId);

    await appRef.update({ 
      status,
      updatedAt: new Date() 
    });

    res.status(200).json({ message: "Application status updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Publish Admissions
export const publishAdmissions = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { title, description } = req.body;

    const admissionRef = await db.collection("institutions")
      .doc(institutionId)
      .collection("admissions")
      .add({
        title,
        description,
        publishedAt: new Date(),
        status: "published"
      });

    // Update institution to mark admissions as published
    await db.collection("institutions").doc(institutionId).update({
      admissionsPublished: true,
      lastAdmissionUpdate: new Date()
    });

    res.status(200).json({ 
      message: "Admissions published successfully",
      admissionId: admissionRef.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { name, location, contact, website } = req.body;

    await db.collection("institutions").doc(institutionId).update({
      name,
      location,
      contact,
      website,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Institute Profile
export const getInstituteProfile = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const doc = await db.collection("institutions").doc(institutionId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Institution not found" });
    }
    
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Faculties
export const getFaculties = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const snapshot = await db.collection(`institutions/${institutionId}/faculties`).get();
    
    const faculties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Courses
export const getCourses = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const snapshot = await db.collection(`institutions/${institutionId}/courses`).get();
    
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Admissions
export const getAdmissions = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const snapshot = await db.collection(`institutions/${institutionId}/admissions`).get();
    
    const admissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};