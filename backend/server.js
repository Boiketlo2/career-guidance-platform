import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import instituteRoutes from "./routes/instituteRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";

// Import Firebase connection
import { db, auth } from "./utils/firebase.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

let firebaseConnected = false;
let firebaseAuthConnected = false;

/**
 * Test Firebase Connection
 */
async function testFirebaseConnection() {
  console.log("\n🔐 Testing Firebase Connection...");

  try {
    // Test Firestore with Admin SDK (no REST calls)
    console.log("   Testing Firestore...");
    const testDoc = db.collection("connectionTests").doc("serverStartup");
    await testDoc.set({
      message: "Server startup connection test",
      timestamp: new Date().toISOString(),
      status: "success",
    });

    const docSnap = await testDoc.get();
    if (docSnap.exists) {
      firebaseConnected = true;
      console.log("   ✅ Firestore: CONNECTED");
    } else {
      console.log("   ❌ Firestore: DOCUMENT NOT FOUND");
    }

    // Test Auth
    console.log("   Testing Firebase Auth...");
    try {
      const users = await auth.listUsers(1);
      firebaseAuthConnected = users.users.length >= 0;
      console.log("   ✅ Firebase Auth: CONNECTED");
    } catch (authError) {
      console.log("   ❌ Firebase Auth: FAILED -", authError.message);
    }

    await testDoc.delete();
  } catch (error) {
    console.log("   ❌ Firebase Connection Failed:", error.message);
    firebaseConnected = false;
    firebaseAuthConnected = false;
  }
}

/**
 * Initialize Server
 */
async function initializeServer() {
  console.log("🚀 Initializing Career Guidance Platform Server...\n");

  await testFirebaseConnection();

  // Middleware
  app.use(
    cors({
  origin: process.env.CLIENT_URL || "https://career-guidance-platform-1-t41w.onrender.com",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.json({
      message: "🌍 Career Guidance Platform Backend Server",
      status: "Running",
      firebase: {
        firestore: firebaseConnected ? "Connected" : "Disconnected",
        auth: firebaseAuthConnected ? "Connected" : "Disconnected",
      },
    });
  });

  // ✅ Mount API routes only if Firebase is connected
  if (firebaseConnected) {
    app.use("/api/auth", authRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/institute", instituteRoutes);
    app.use("/api/student", studentRoutes);
    app.use("/api/company", companyRoutes);
    console.log("   ✅ API Routes: MOUNTED");
  } else {
    console.log("   ⚠️  API Routes: NOT MOUNTED (Firebase disconnected)");
    app.use("/api", (req, res) => {
      res.status(503).json({
        error: "Service Unavailable",
        message:
          "Firebase database connection is not available. Please try again later.",
        timestamp: new Date().toISOString(),
      });
    });
  }

  // 404 fallback — fixed for router compatibility
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
      path: req.originalUrl,
    });
  });

  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n✅ Server running on port ${PORT}`);
    console.log(
      `📡 Firebase Firestore: ${firebaseConnected ? "Connected" : "Disconnected"}`
    );
    console.log(
      `👤 Firebase Auth: ${firebaseAuthConnected ? "Connected" : "Disconnected"}`
    );
  });
}

// Handle errors
process.on("unhandledRejection", (err) =>
  console.error("❌ Unhandled Rejection:", err)
);
process.on("uncaughtException", (err) =>
  console.error("❌ Uncaught Exception:", err)
);

initializeServer().catch((err) => {
  console.error("❌ Failed to initialize server:", err);
  process.exit(1);
});
