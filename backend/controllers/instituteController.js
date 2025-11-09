import { db, auth } from "../utils/firebase.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ---------------------
// ✅ Register Institute
// ---------------------
export const registerInstitute = asyncHandler(async (req, res) => {
  const { email, password, name, location, contact, website, description, type } = req.body;

  const existingInstitution = await db.collection("institutions").where("email", "==", email).get();
  if (!existingInstitution.empty) {
    return res.status(400).json({ success: false, error: "Institution with this email already exists" });
  }

  const user = await auth.createUser({ email, password, displayName: name, emailVerified: false });

  const institutionData = {
    name,
    email,
    location,
    contact: contact || "",
    website: website || "",
    description: description || "",
    type: type || "Private",
    authUserId: user.uid,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.collection("institutions").doc(user.uid).set(institutionData);
  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    email,
    role: "institution",
    institutionName: name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailVerified: false
  });

  res.status(201).json({
    success: true,
    message: "Institute registered successfully",
    institution: { uid: user.uid, ...institutionData }
  });
});

// ---------------------
// ✅ Login Institute
// ---------------------
export const loginInstitute = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Use client-side Firebase Auth for login, then verify token on protected routes"
  });
});

// ---------------------
// ✅ Add Faculty
// ---------------------
export const addFaculty = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const { name, description } = req.body;

  const institutionDoc = await db.collection("institutions").doc(institutionId).get();
  if (!institutionDoc.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  const facultyData = { 
    name, 
    description: description || "", 
    institutionId, 
    courses: [], 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const facultyRef = await db.collection("faculties").add(facultyData);

  res.status(201).json({ 
    success: true, 
    message: "Faculty added successfully", 
    faculty: { id: facultyRef.id, ...facultyData } 
  });
});

// ---------------------
// ✅ Add Course
// ---------------------
export const addCourse = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const { name, facultyId, description, requirements, duration, credits } = req.body;

  const [institutionDoc, facultyDoc] = await Promise.all([
    db.collection("institutions").doc(institutionId).get(),
    db.collection("faculties").doc(facultyId).get()
  ]);

  if (!institutionDoc.exists) return res.status(404).json({ success: false, error: "Institution not found" });
  if (!facultyDoc.exists) return res.status(404).json({ success: false, error: "Faculty not found" });

  const courseData = { 
    name, 
    facultyId, 
    description: description || "", 
    requirements: requirements || [], 
    duration: duration || "", 
    credits: credits || 0, 
    institutionId, 
    status: "active", 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  const courseRef = await db.collection("courses").add(courseData);

  const facultyData = facultyDoc.data();
  await db.collection("faculties").doc(facultyId).update({
    courses: [...(facultyData.courses || []), { id: courseRef.id, name: courseData.name }],
    updatedAt: new Date().toISOString()
  });

  res.status(201).json({ 
    success: true, 
    message: "Course added successfully", 
    course: { id: courseRef.id, ...courseData } 
  });
});

// ---------------------
// ✅ UPDATED: View Applications with index fallback
// ---------------------
export const getApplications = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;

  console.log("🔍 Fetching applications for institution:", institutionId);
  
  try {
    // First, check if institution exists
    const institutionDoc = await db.collection("institutions").doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: "Institution not found" 
      });
    }

    let applicationsSnapshot;
    
    try {
      // Try with ordering first (requires index)
      console.log("🔄 Trying to fetch applications with ordering...");
      applicationsSnapshot = await db.collection("applications")
        .where("institutionId", "==", institutionId)
        .orderBy("appliedAt", "desc")
        .get();
      console.log("✅ Successfully fetched with ordering");
    } catch (orderError) {
      console.log("⚠️ OrderBy failed, trying without ordering:", orderError.message);
      
      // Fallback: Get applications without ordering
      applicationsSnapshot = await db.collection("applications")
        .where("institutionId", "==", institutionId)
        .get();
      console.log("✅ Successfully fetched without ordering");
    }

    console.log("📊 Applications found:", applicationsSnapshot.size);
    
    const applications = await Promise.all(applicationsSnapshot.docs.map(async doc => {
      const data = doc.data();
      let courseDetails = {};
      let studentDetails = {};

      try {
        // Get course details
        if (data.courseId) {
          const courseDoc = await db.collection("courses").doc(data.courseId).get();
          if (courseDoc.exists) {
            courseDetails = { 
              id: courseDoc.id, 
              name: courseDoc.data().name 
            };
          }
        }

        // Get student details
        if (data.studentId) {
          const studentDoc = await db.collection("users").doc(data.studentId).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            studentDetails = { 
              id: studentDoc.id, 
              name: studentData.name, 
              email: studentData.email 
            };
          }
        }
      } catch (error) {
        console.error("Error fetching details for application:", doc.id, error);
      }

      return {
        id: doc.id,
        ...data,
        studentDetails,
        courseDetails
      };
    }));

    // If we couldn't order by appliedAt, sort manually
    if (applications.length > 0) {
      applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }

    console.log("✅ Successfully processed applications:", applications.length);
    
    res.status(200).json({ 
      success: true, 
      count: applications.length, 
      applications 
    });
    
  } catch (error) {
    console.error("❌ Error in getApplications:", error);
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to load applications",
      details: error.message 
    });
  }
});

// ---------------------
// ✅ Update Admission Status
// ---------------------
export const updateAdmissionStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status, notes } = req.body;

  console.log("🔄 Updating application status:", { applicationId, status, notes });

  const applicationRef = db.collection("applications").doc(applicationId);
  const applicationDoc = await applicationRef.get();
  if (!applicationDoc.exists) return res.status(404).json({ success: false, error: "Application not found" });

  const updateData = { 
    status, 
    notes: notes || "", 
    reviewedAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  
  await applicationRef.update(updateData);

  console.log("✅ Application status updated successfully");

  res.status(200).json({ success: true, message: "Application status updated successfully" });
});

// ---------------------
// ✅ Publish Admissions
// ---------------------
export const publishAdmissions = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const { title, description, deadline } = req.body;

  const institutionDoc = await db.collection("institutions").doc(institutionId).get();
  if (!institutionDoc.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  const admissionData = { 
    title, 
    description: description || "", 
    institutionId, 
    deadline: deadline ? new Date(deadline).toISOString() : null, 
    status: "published", 
    publishedAt: new Date().toISOString(), 
    createdAt: new Date().toISOString() 
  };
  const admissionRef = await db.collection("admissions").add(admissionData);

  await db.collection("institutions").doc(institutionId).update({ 
    admissionsPublished: true, 
    lastAdmissionUpdate: new Date().toISOString() 
  });

  res.status(201).json({ 
    success: true, 
    message: "Admissions published successfully", 
    admission: { id: admissionRef.id, ...admissionData } 
  });
});

// ---------------------
// ✅ Profile Management
// ---------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const updateData = req.body;

  const institutionRef = db.collection("institutions").doc(institutionId);
  const institutionDoc = await institutionRef.get();
  if (!institutionDoc.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  const updatedData = { ...updateData, updatedAt: new Date().toISOString() };
  await institutionRef.update(updatedData);
  await db.collection("users").doc(institutionId).update(updatedData);

  res.status(200).json({ success: true, message: "Profile updated successfully" });
});

export const getInstituteProfile = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const institutionDoc = await db.collection("institutions").doc(institutionId).get();
  if (!institutionDoc.exists) return res.status(404).json({ success: false, error: "Institution not found" });

  res.status(200).json({ success: true, institution: { id: institutionDoc.id, ...institutionDoc.data() } });
});

// ---------------------
// ✅ UPDATED: Get Faculties with better error handling
// ---------------------
export const getFaculties = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  
  console.log("🔍 Fetching faculties for institution:", institutionId);
  
  try {
    // First, check if institution exists
    const institutionDoc = await db.collection("institutions").doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: "Institution not found" 
      });
    }

    // Try with ordering first
    let snapshot;
    try {
      snapshot = await db.collection("faculties")
        .where("institutionId", "==", institutionId)
        .orderBy("createdAt", "desc")
        .get();
    } catch (orderError) {
      console.log("⚠️ OrderBy failed, trying without ordering:", orderError.message);
      // If ordering fails, try without ordering
      snapshot = await db.collection("faculties")
        .where("institutionId", "==", institutionId)
        .get();
    }

    console.log("📊 Faculties found:", snapshot.size);
    
    const faculties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("✅ Successfully fetched faculties:", faculties.length);
    
    res.status(200).json({ 
      success: true, 
      count: faculties.length, 
      faculties 
    });
    
  } catch (error) {
    console.error("❌ Error in getFaculties:", error);
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to load faculties",
      details: error.message 
    });
  }
});

// ---------------------
// ✅ UPDATED: Get Courses with better error handling
// ---------------------
export const getCourses = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  
  console.log("🔍 Fetching courses for institution:", institutionId);
  
  try {
    // First, check if institution exists
    const institutionDoc = await db.collection("institutions").doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: "Institution not found" 
      });
    }

    // Try with ordering first
    let snapshot;
    try {
      snapshot = await db.collection("courses")
        .where("institutionId", "==", institutionId)
        .orderBy("createdAt", "desc")
        .get();
    } catch (orderError) {
      console.log("⚠️ OrderBy failed, trying without ordering:", orderError.message);
      // If ordering fails, try without ordering
      snapshot = await db.collection("courses")
        .where("institutionId", "==", institutionId)
        .get();
    }

    console.log("📊 Courses found:", snapshot.size);
    
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("✅ Successfully fetched courses:", courses.length);
    
    res.status(200).json({ 
      success: true, 
      count: courses.length, 
      courses 
    });
    
  } catch (error) {
    console.error("❌ Error in getCourses:", error);
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to load courses",
      details: error.message 
    });
  }
});

// ---------------------
// ✅ Get Admissions
// ---------------------
export const getAdmissions = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const snapshot = await db.collection("admissions").where("institutionId", "==", institutionId).orderBy("publishedAt", "desc").get();
  const admissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json({ success: true, count: admissions.length, admissions });
});