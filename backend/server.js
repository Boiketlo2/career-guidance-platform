// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Import routes
import studentRoutes from "./routes/studentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
// Load Firebase credentials
// -------------------------
let serviceAccount;

try {
  if (process.env.FIREBASE_CREDENTIALS.startsWith("{")) {
    // 🔹 Cloud environment: JSON string in env
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    console.log("✅ Loaded Firebase credentials from environment variable.");
  } else {
    // 🔹 Local environment: path to JSON file
    const serviceAccountPath = path.join(process.cwd(), process.env.FIREBASE_CREDENTIALS);
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    console.log("✅ Loaded Firebase credentials from local file.");
  }
} catch (error) {
  console.error("❌ Failed to load Firebase credentials:", error.message);
  process.exit(1);
}

// -------------------------
// Initialize Firebase Admin safely
// -------------------------
let appFirebase;

// 🔹 Use admin.apps to check if Firebase is already initialized
if (!admin.apps.length) {
  appFirebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // No storageBucket — avoids billing-required features
  });
  console.log("🔥 Firebase initialized successfully.");
} else {
  appFirebase = admin.apps[0]; // reuse existing app
  console.log("⚡ Firebase app already initialized, reusing existing app.");
}

const db = admin.firestore();

// -------------------------
// Routes
// -------------------------
app.get("/", (req, res) => res.send("✅ Backend is running"));

// 🔹 Firestore connection test endpoint
app.get("/test-db", async (req, res) => {
  try {
    const testRef = db.collection("test");
    await testRef.doc("connection-check").set({
      status: "success",
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      connected: true,
      message: "🔥 Firestore connection successful!",
    });
  } catch (error) {
    console.error("Firestore connection error:", error);
    res.status(500).json({
      connected: false,
      error: error.message,
    });
  }
});

// -------------------------
// Student & Company Routes
// -------------------------
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoutes);

// -------------------------
// Auto-test Firestore on startup
// -------------------------
const testFirestore = async () => {
  try {
    const testRef = db.collection("test");
    await testRef.doc("connection-check").set({
      status: "success",
      timestamp: new Date().toISOString(),
    });
    console.log("🔥 Firestore connection successful!");
  } catch (error) {
    console.error("Firestore connection error:", error.message);
  }
};

testFirestore();

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// -------------------------
// Export db for seeding or other modules
// -------------------------
export { db };
