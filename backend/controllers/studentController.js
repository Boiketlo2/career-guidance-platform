import { db } from "../utils/firebase.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendJobApplicationNotification } from "../utils/emailService.js";

// 🔹 Get all institutions with faculties and courses
export const getInstitutionsWithCourses = asyncHandler(async (req, res) => {
  const institutionsSnapshot = await db.collection("institutions").orderBy("name").get();

  const institutions = await Promise.all(
    institutionsSnapshot.docs.map(async instDoc => {
      const institutionData = instDoc.data();

      const facultiesSnapshot = await db.collection("faculties")
        .where("institutionId", "==", instDoc.id)
        .get();

      const faculties = await Promise.all(facultiesSnapshot.docs.map(async facDoc => {
        const facultyData = facDoc.data();

        const coursesSnapshot = await db.collection("courses")
          .where("facultyId", "==", facDoc.id)
          .get();

        const courses = coursesSnapshot.docs.map(courseDoc => ({
          id: courseDoc.id,
          ...courseDoc.data(),
        }));

        return { id: facDoc.id, ...facultyData, courses };
      }));

      return { id: instDoc.id, ...institutionData, faculties };
    })
  );

  res.status(200).json({ success: true, count: institutions.length, institutions });
});

// 🔹 Get courses by institution ID
export const getCoursesByInstitution = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const institutionDoc = await db.collection("institutions").doc(institutionId).get();

  if (!institutionDoc.exists) {
    return res.status(404).json({ success: false, error: "Institution not found" });
  }

  const facultiesSnapshot = await db.collection("faculties")
    .where("institutionId", "==", institutionId)
    .get();

  const courses = [];
  for (const facDoc of facultiesSnapshot.docs) {
    const facultyData = facDoc.data();
    const coursesSnapshot = await db.collection("courses")
      .where("facultyId", "==", facDoc.id)
      .get();

    courses.push(...coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      faculty: facultyData.name,
      institutionName: institutionDoc.data().name
    })));
  }

  res.status(200).json({ success: true, count: courses.length, courses });
});

// 🔹 Apply for a course (max 2 per institution)
export const applyForCourse = asyncHandler(async (req, res) => {
  const { studentId, courseId, institutionId, personalStatement } = req.body;

  const studentRef = db.collection("users").doc(studentId);
  const studentDoc = await studentRef.get();
  if (!studentDoc.exists) return res.status(404).json({ success: false, error: "Student not found" });

  const courseDoc = await db.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) return res.status(404).json({ success: false, error: "Course not found" });

  // Restrict: max 2 per institution
  const existingApplications = await db.collection("applications")
    .where("studentId", "==", studentId)
    .where("institutionId", "==", institutionId)
    .get();

  if (existingApplications.size >= 2)
    return res.status(400).json({ success: false, error: "You can only apply for 2 courses per institution" });

  // Restrict: cannot apply twice for same course
  const duplicate = await db.collection("applications")
    .where("studentId", "==", studentId)
    .where("courseId", "==", courseId)
    .get();

  if (!duplicate.empty)
    return res.status(400).json({ success: false, error: "You have already applied to this course" });

  const appData = {
    studentId,
    institutionId,
    courseId,
    courseName: courseDoc.data().name,
    studentName: studentDoc.data().name,
    studentEmail: studentDoc.data().email,
    personalStatement: personalStatement || "",
    status: "pending",
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const appRef = await db.collection("applications").add(appData);

  await studentRef.update({
    applications: [...(studentDoc.data().applications || []), { applicationId: appRef.id, ...appData }],
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, message: "Application submitted successfully", application: { id: appRef.id, ...appData } });
});

// 🔹 Get student applications
export const getStudentApplications = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const snapshot = await db.collection("applications")
    .where("studentId", "==", studentId)
    .orderBy("appliedAt", "desc")
    .get();

  const applications = await Promise.all(snapshot.docs.map(async doc => {
    const data = doc.data();

    const courseDoc = await db.collection("courses").doc(data.courseId).get();
    const institutionDoc = await db.collection("institutions").doc(data.institutionId).get();

    return {
      id: doc.id,
      ...data,
      courseDetails: courseDoc.exists ? courseDoc.data() : {},
      institutionDetails: institutionDoc.exists ? institutionDoc.data() : {}
    };
  }));

  res.status(200).json({ success: true, count: applications.length, applications });
});

// 🔹 Upload student document
export const uploadDocument = asyncHandler(async (req, res) => {
  const { studentId, documentType, documentName, fileUrl } = req.body;
  const studentRef = db.collection("users").doc(studentId);
  const studentDoc = await studentRef.get();

  if (!studentDoc.exists) return res.status(404).json({ success: false, error: "Student not found" });

  const docData = {
    id: crypto.randomUUID(),
    type: documentType,
    name: documentName,
    fileUrl: fileUrl || "",
    uploadedAt: new Date().toISOString(),
  };

  const field = documentType === "transcript" ? "transcripts" :
                documentType === "certificate" ? "certificates" : "documents";

  await studentRef.update({
    [field]: [...(studentDoc.data()[field] || []), docData],
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({ success: true, message: "Document uploaded successfully", document: docData });
});

// 🔹 Get admission results - SIMPLIFIED WORKING VERSION
export const getAdmissionResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  console.log(`🔍 Fetching admission results for: ${studentId}`);
  
  try {
    // Query applications directly
    const snapshot = await db.collection("applications")
      .where("studentId", "==", studentId)
      .orderBy("appliedAt", "desc")
      .get();

    console.log(`📊 Found ${snapshot.size} applications`);

    if (snapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        count: 0, 
        results: [],
        message: "No applications found" 
      });
    }

    // Process applications without complex joins
    const results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Use the data that's already stored in the application
        courseName: data.courseName,
        institutionName: data.institutionName || "Institution",
        // Add simple details if needed
        courseDetails: { name: data.courseName },
        institutionDetails: { name: data.institutionName || "Institution" }
      };
    });

    res.status(200).json({ 
      success: true, 
      count: results.length, 
      results 
    });

  } catch (error) {
    console.error("Error in getAdmissionResults:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch admission results"
    });
  }
});

// 🔹 Update student profile
export const updateStudentProfile = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { name, phone, location, address, highSchool, graduationYear, dateOfBirth } = req.body;

  const studentRef = db.collection("users").doc(studentId);
  const studentDoc = await studentRef.get();
  if (!studentDoc.exists) return res.status(404).json({ success: false, error: "Student not found" });

  const updateData = {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(location && { location }),
    ...(address && { address }),
    ...(highSchool && { highSchool }),
    ...(graduationYear && { graduationYear }),
    ...(dateOfBirth && { dateOfBirth }),
    updatedAt: new Date().toISOString(),
  };

  await studentRef.update(updateData);
  res.status(200).json({ success: true, message: "Profile updated successfully", updateData });
});

// 🔹 Add work experience
export const addWorkExperience = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { company, position, startDate, endDate, description, isCurrent } = req.body;

  const studentRef = db.collection("users").doc(studentId);
  const studentDoc = await studentRef.get();
  if (!studentDoc.exists) return res.status(404).json({ success: false, error: "Student not found" });

  const workExp = {
    id: crypto.randomUUID(),
    company,
    position,
    startDate,
    endDate: isCurrent ? null : endDate,
    description: description || "",
    isCurrent: !!isCurrent,
    addedAt: new Date().toISOString(),
  };

  await studentRef.update({
    workExperience: [...(studentDoc.data().workExperience || []), workExp],
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, message: "Work experience added successfully", workExp });
});

// 🔹 Get all jobs from all companies
export const getAllJobs = asyncHandler(async (req, res) => {
  try {
    console.log("🔍 Fetching all jobs from companies...");
    
    // Get all companies
    const companiesSnapshot = await db.collection("companies").get();
    
    if (companiesSnapshot.empty) {
      return res.status(200).json({ success: true, count: 0, jobs: [] });
    }

    const jobs = [];
    
    // Iterate through each company and get their job posts
    for (const companyDoc of companiesSnapshot.docs) {
      const companyData = companyDoc.data();
      
      // Check if company is approved
      if (companyData.approved !== true) continue;
      
      try {
        // Get job posts for this company
        const jobPostsSnapshot = await db.collection("companies")
          .doc(companyDoc.id)
          .collection("jobPosts")
          .get();

        // Add each job to the jobs array with company info
        jobPostsSnapshot.docs.forEach(jobDoc => {
          const jobData = jobDoc.data();
          jobs.push({
            id: jobDoc.id,
            companyId: companyDoc.id,
            companyName: companyData.name || "Unknown Company",
            companyIndustry: companyData.industry || "Unknown Industry",
            companyWebsite: companyData.website || "",
            companyStatus: companyData.status || "Unknown",
            ...jobData,
            // Ensure requirements is always an array
            requirements: Array.isArray(jobData.requirements) ? jobData.requirements : 
                        jobData.requirements ? [jobData.requirements] : []
          });
        });
      } catch (error) {
        console.log(`⚠️ No jobPosts collection for company: ${companyData.name}`);
        continue;
      }
    }

    // Sort jobs by creation date or title
    jobs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    console.log(`📊 Found ${jobs.length} jobs from ${companiesSnapshot.size} companies`);
    
    res.status(200).json({ 
      success: true, 
      count: jobs.length, 
      jobs 
    });

  } catch (error) {
    console.error("❌ Error in getAllJobs:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch jobs",
      details: error.message 
    });
  }
});

// 🔹 Apply for a job
export const applyForJob = asyncHandler(async (req, res) => {
  const { studentId, jobId, companyId } = req.body;

  console.log(`📝 Job application request:`, { studentId, jobId, companyId });

  try {
    const [studentDoc, companyDoc] = await Promise.all([
      db.collection("users").doc(studentId).get(),
      db.collection("companies").doc(companyId).get()
    ]);

    if (!studentDoc.exists) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    if (!companyDoc.exists) {
      return res.status(404).json({ success: false, error: "Company not found" });
    }

    // Get the specific job post
    const jobDoc = await db.collection("companies")
      .doc(companyId)
      .collection("jobPosts")
      .doc(jobId)
      .get();

    if (!jobDoc.exists) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    const jobData = jobDoc.data();
    const studentData = studentDoc.data();
    const companyData = companyDoc.data();

    // Check if student already applied
    const currentApplicants = jobData.applicants || [];
    if (currentApplicants.includes(studentId)) {
      return res.status(400).json({ success: false, error: "Already applied for this job" });
    }

    // Update job applicants
    await db.collection("companies")
      .doc(companyId)
      .collection("jobPosts")
      .doc(jobId)
      .update({
        applicants: [...currentApplicants, studentId],
        updatedAt: new Date().toISOString(),
      });

    // Also update student's job applications
    const jobApplication = {
      jobId,
      companyId,
      companyName: companyData.name,
      jobTitle: jobData.title,
      appliedAt: new Date().toISOString(),
      status: "pending"
    };

    await db.collection("users").doc(studentId).update({
      jobApplications: [...(studentData.jobApplications || []), jobApplication],
      updatedAt: new Date().toISOString(),
    });

    // Send email notification if email service is configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendJobApplicationNotification(
          studentData.email, 
          studentData.name, 
          companyData.name, 
          jobData.title
        );
      } catch (emailError) {
        console.error("❌ Email notification failed:", emailError);
        // Don't fail the request if email fails
      }
    }

    console.log(`✅ Job application successful for student ${studentId} to job ${jobId}`);
    
    res.status(200).json({ 
      success: true, 
      message: "Job application submitted successfully",
      application: jobApplication
    });

  } catch (error) {
    console.error("❌ Error in applyForJob:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit job application",
      details: error.message 
    });
  }
});

// 🔹 Get student profile
export const getStudentProfile = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const studentDoc = await db.collection("users").doc(studentId).get();
  if (!studentDoc.exists) return res.status(404).json({ success: false, error: "Student not found" });

  res.status(200).json({ success: true, student: { id: studentDoc.id, ...studentDoc.data() } });
});

// 🔹 Get student documents
export const getStudentDocuments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { type } = req.query;

  const studentDoc = await db.collection("users").doc(studentId).get();
  if (!studentDoc.exists) return res.status(404).json({ success: false, error: "Student not found" });

  const data = studentDoc.data();
  let documents = [];

  if (type === "transcript") documents = data.transcripts || [];
  else if (type === "certificate") documents = data.certificates || [];
  else {
    documents = [
      ...(data.transcripts || []).map(d => ({ ...d, documentType: "transcript" })),
      ...(data.certificates || []).map(d => ({ ...d, documentType: "certificate" }))
    ];
  }

  res.status(200).json({ success: true, count: documents.length, documents });
});

// 🔹 Get student job applications
export const getStudentJobApplications = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const studentDoc = await db.collection("users").doc(studentId).get();
  if (!studentDoc.exists) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  const studentData = studentDoc.data();
  const jobApplications = studentData.jobApplications || [];

  res.status(200).json({ 
    success: true, 
    count: jobApplications.length, 
    applications: jobApplications 
  });
});