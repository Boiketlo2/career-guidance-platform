// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import adminRoutes from "./routes/AdminRoutes.js";
import "./config/Firebase.js"; // Ensure Firebase initializes first

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Mount Admin Routes
app.use("/api/admin", adminRoutes);

// ✅ Base route for testing
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Centralized error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port 5000`));
