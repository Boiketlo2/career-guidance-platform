// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import instituteRoutes from "./routes/instituteRoutes.js";
import { db } from "./utils/firebase.js"; // ✅ Already initialized

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route – just confirms backend is running
app.get("/", (req, res) => {
  res.send("🌍 Backend server running successfully!");
});

// Test Firebase route – reads a few documents from Firestore
app.get("/test-firebase", async (req, res) => {
  try {
    const snapshot = await db.collection("serverTest").limit(5).get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    res.send({ message: "✅ Firebase connection OK", recentDocs: docs });
  } catch (error) {
    console.error("Firebase test failed:", error);
    res.status(500).send({ message: "Firebase test failed", error: error.message });
  }
});

// API routes
app.use("/api/institute", instituteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));
