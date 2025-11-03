import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// -------------------------
// Initialize Firebase Admin
// -------------------------
const serviceAccountPath = path.join(process.cwd(), process.env.FIREBASE_CREDENTIALS);

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} catch (error) {
  console.error("❌ Failed to read serviceAccountKey.json:", error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();

// -------------------------
// User Data
// -------------------------
const users = [
  {
    id: "student_palesa_mohapi",
    name: "Palesa Mohapi",
    email: "palesa.mohapi@student.nul.ls",
    institution: "National University of Lesotho",
    faculty: "Faculty of Science & Technology",
    program: "BSc Computer Science",
    year: 3,
    role: "student",
    applications: [
      {
        jobId: "Electrical Engineer",
        company: "Lesotho Electricity Company (LEC)",
        status: "pending",
        dateApplied: "2025-10-19",
      },
    ],
    reports: [
      {
        title: "Internship Progress Report",
        content:
          "Completed network configuration and assisted in IT support tasks. Developed a web interface for system monitoring.",
        dateSubmitted: "2025-09-30",
      },
    ],
  },
  {
    id: "lecturer_thabo_lekhooa",
    name: "Thabo Lekhooa",
    email: "thabo.lekhooa@nul.ls",
    institution: "National University of Lesotho",
    faculty: "Faculty of Science & Technology",
    department: "Computer Science",
    role: "lecturer",
    feedback: [
      {
        studentId: "student_palesa_mohapi",
        comment:
          "Excellent performance during internship, shows initiative and teamwork.",
        dateGiven: "2025-10-10",
      },
    ],
    supervised_students: [
      {
        studentId: "student_palesa_mohapi",
        projectTitle: "AI-driven career guidance chatbot",
      },
    ],
  },
  {
    id: "recruiter_mpho_seema",
    name: "Mpho Seema",
    email: "mpho.seema@lec.co.ls",
    company: "Lesotho Electricity Company (LEC)",
    position: "HR Officer",
    role: "recruiter",
    posted_jobs: [
      {
        jobId: "Electrical Engineer",
        title: "Electrical Engineer",
        status: "open",
        datePosted: "2025-09-01",
      },
    ],
    applications_received: [
      {
        applicantId: "student_palesa_mohapi",
        jobId: "Electrical Engineer",
        status: "pending",
        dateReceived: "2025-10-19",
      },
    ],
  },
  {
    id: "admin_letsema_ramokoena",
    name: "Letsema Ramokoena",
    email: "letsema.ramokoena@careerplatform.ls",
    role: "admin",
    system_logs: [
      {
        action: "User account created",
        user: "student_palesa_mohapi",
        timestamp: "2025-10-19T12:00:00Z",
      },
    ],
  },
];

// -------------------------
// Seed Function
// -------------------------
async function seedUsers() {
  console.log("🌱 Seeding users and subcollections...");
  const usersRef = db.collection("users");

  for (const user of users) {
    const userRef = usersRef.doc(user.id);

    // Create main user doc (excluding subcollections)
    const { applications, reports, feedback, supervised_students, posted_jobs, applications_received, system_logs, ...userData } = user;
    await userRef.set(userData);
    console.log(`✅ Added user: ${user.name} (${user.role})`);

    // Add subcollections if any
    const subcollections = {
      applications,
      reports,
      feedback,
      supervised_students,
      posted_jobs,
      applications_received,
      system_logs,
    };

    for (const [subName, docs] of Object.entries(subcollections)) {
      if (docs && docs.length > 0) {
        for (const doc of docs) {
          const docRef = userRef.collection(subName).doc();
          await docRef.set(doc);
        }
        console.log(`   └─ Added ${docs.length} docs in '${subName}' for ${user.name}`);
      }
    }
  }

  console.log("🎉 Users and subcollections seeding complete!");
  process.exit(0);
}

// -------------------------
// Run Seeder
// -------------------------
seedUsers().catch((error) => {
  console.error("❌ Error seeding users:", error);
  process.exit(1);
});
