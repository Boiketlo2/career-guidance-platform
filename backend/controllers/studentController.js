import { db } from "../utils/firebase.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendJobApplicationNotification } from "../utils/emailService.js";

// Grading configuration for Lesotho LGCSE
const GRADING_SCALE = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7
};

// Predefined Lesotho subjects
const PREDEFINED_SUBJECTS = [
  "Mathematics", "English", "Sesotho", "Science", "Biology", 
  "Physics", "Chemistry", "Geography", "History", "Commerce",
  "Accounting", "Agriculture", "Computer Studies", "Development Studies",
  "Religious Education", "French", "Business Studies", "Economics",
  "Physical Education", "Art and Design"
];

// Valid grades for dropdown
const VALID_GRADES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// 🔹 Save student subjects and grades
export const saveStudentSubjects = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subjects } = req.body;

  console.log(`📚 Saving subjects for student: ${studentId}`, subjects);

  // Validate input
  if (!subjects || !Array.isArray(subjects)) {
    return res.status(400).json({ 
      success: false, 
      error: "Subjects must be an array" 
    });
  }

  // Validate each subject
  for (const subject of subjects) {
    if (!subject.subject || !subject.grade) {
      return res.status(400).json({ 
        success: false, 
        error: "Each subject must have subject name and grade" 
      });
    }
    
    if (!VALID_GRADES.includes(subject.grade.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid grade: ${subject.grade}. Must be one of: ${VALID_GRADES.join(', ')}` 
      });
    }
  }

  const studentRef = db.collection("users").doc(studentId);
  const studentDoc = await studentRef.get();

  if (!studentDoc.exists) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  // Update student with subjects
  await studentRef.update({
    subjects: subjects.map(subject => ({
      ...subject,
      grade: subject.grade.toUpperCase() // Ensure consistent casing
    })),
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({ 
    success: true, 
    message: "Subjects saved successfully",
    subjects: subjects.map(subject => ({
      ...subject,
      grade: subject.grade.toUpperCase()
    }))
  });
});

// 🔹 Get student subjects
export const getStudentSubjects = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const studentDoc = await db.collection("users").doc(studentId).get();
  
  if (!studentDoc.exists) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  const studentData = studentDoc.data();
  const subjects = studentData.subjects || [];

  res.status(200).json({ 
    success: true, 
    subjects,
    predefinedSubjects: PREDEFINED_SUBJECTS,
    validGrades: VALID_GRADES
  });
});

// 🔹 Get predefined subjects list
export const getPredefinedSubjects = asyncHandler(async (req, res) => {
  res.status(200).json({ 
    success: true, 
    subjects: PREDEFINED_SUBJECTS,
    grades: VALID_GRADES
  });
});

// Helper function to parse course requirements
const parseRequirement = (reqString) => {
  // Handle different requirement formats
  const patterns = [
    /^([a-zA-Z\s]+)\s+([A-G1-7])$/,  // "Mathematics C"
    /^([a-zA-Z\s]+)\s+Grade\s+([A-G1-7])$/i, // "Mathematics Grade C"
    /^([a-zA-Z\s]+)\s+at\s+least\s+([A-G1-7])$/i, // "Mathematics at least C"
    /^Grade\s+([A-G1-7])\s+in\s+([a-zA-Z\s]+)$/i // "Grade C in Mathematics"
  ];
  
  for (let pattern of patterns) {
    const match = reqString.match(pattern);
    if (match) {
      // Handle different pattern groups
      let subject, minGrade;
      if (pattern.source.includes('Grade.*in')) {
        minGrade = match[1].toUpperCase();
        subject = match[2].trim();
      } else {
        subject = match[1].trim();
        minGrade = match[2].toUpperCase();
      }
      
      return {
        subject,
        minGrade,
        type: 'grade_requirement'
      };
    }
  }
  
  // Handle non-grade requirements
  if (reqString.toLowerCase().includes('at least') && 
      reqString.toLowerCase().includes('pass')) {
    return {
      type: 'minimum_passes',
      description: reqString
    };
  }
  
  // Return as general requirement
  return {
    type: 'general',
    description: reqString
  };
};

// Helper function to check if student qualifies for a course
const studentQualifiesForCourse = (studentSubjects, courseRequirements) => {
  if (!courseRequirements || !Array.isArray(courseRequirements) || courseRequirements.length === 0) {
    return true; // No requirements specified, student qualifies
  }

  const studentGradeMap = {};
  studentSubjects.forEach(subject => {
    studentGradeMap[subject.subject.toLowerCase()] = subject.grade;
  });

  let totalPasses = 0;
  let requiredPasses = 0;

  for (const reqString of courseRequirements) {
    const requirement = parseRequirement(reqString);
    
    if (requirement.type === 'grade_requirement') {
      const studentGrade = studentGradeMap[requirement.subject.toLowerCase()];
      
      if (!studentGrade) {
        return false; // Student doesn't have this required subject
      }
      
      // Compare grades - lower number is better (A=1, B=2, etc.)
      const studentGradeValue = GRADING_SCALE[studentGrade];
      const requiredGradeValue = GRADING_SCALE[requirement.minGrade];
      
      if (studentGradeValue > requiredGradeValue) {
        return false; // Student's grade is worse than required
      }
    }
    else if (requirement.type === 'minimum_passes') {
      // Count student's passes (E and above are passes)
      totalPasses = studentSubjects.filter(subject => 
        GRADING_SCALE[subject.grade] <= 5 // E or better
      ).length;
      
      // Extract number from "at least X passes"
      const match = requirement.description.match(/at least (\d+)/i);
      requiredPasses = match ? parseInt(match[1]) : 5; // Default to 5 if not specified
    }
  }

  // Check minimum passes requirement
  if (requiredPasses > 0 && totalPasses < requiredPasses) {
    return false;
  }

  return true;
};

// 🔹 Get qualified courses for student
export const getQualifiedCourses = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  console.log(`🎯 Getting qualified courses for student: ${studentId}`);

  try {
    // Get student's subjects
    const studentDoc = await db.collection("users").doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    const studentData = studentDoc.data();
    const studentSubjects = studentData.subjects || [];

    if (studentSubjects.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No subjects found. Please add your academic records first.",
        qualifiedCourses: [],
        totalCourses: 0
      });
    }

    // Get all institutions with courses
    const institutionsSnapshot = await db.collection("institutions").orderBy("name").get();
    
    const qualifiedCourses = [];
    let totalCoursesChecked = 0;

    // Check each course from all institutions
    for (const instDoc of institutionsSnapshot.docs) {
      const institutionData = instDoc.data();
      
      const facultiesSnapshot = await db.collection("faculties")
        .where("institutionId", "==", instDoc.id)
        .get();

      for (const facDoc of facultiesSnapshot.docs) {
        const facultyData = facDoc.data();
        
        const coursesSnapshot = await db.collection("courses")
          .where("facultyId", "==", facDoc.id)
          .get();

        for (const courseDoc of coursesSnapshot.docs) {
          totalCoursesChecked++;
          const courseData = courseDoc.data();
          
          // Check if student qualifies for this course
          const qualifies = studentQualifiesForCourse(
            studentSubjects, 
            courseData.requirements
          );

          if (qualifies) {
            qualifiedCourses.push({
              id: courseDoc.id,
              ...courseData,
              faculty: facultyData.name,
              institution: institutionData.name,
              institutionId: instDoc.id,
              facultyId: facDoc.id
            });
          }
        }
      }
    }

    console.log(`✅ Found ${qualifiedCourses.length} qualified courses out of ${totalCoursesChecked} total courses`);

    res.status(200).json({ 
      success: true, 
      qualifiedCourses,
      totalQualified: qualifiedCourses.length,
      totalChecked: totalCoursesChecked,
      studentSubjectsCount: studentSubjects.length
    });

  } catch (error) {
    console.error("❌ Error in getQualifiedCourses:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch qualified courses",
      details: error.message 
    });
  }
});

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
