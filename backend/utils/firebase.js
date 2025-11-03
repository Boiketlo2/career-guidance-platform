// backend/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load Firebase credentials (from path or env)
let serviceAccount;
try {
  if (process.env.FIREBASE_CREDENTIALS) {
    const credentialsPath = path.resolve(process.cwd(), process.env.FIREBASE_CREDENTIALS);
    console.log(`✅ Firebase service account loaded from: ${credentialsPath}`);
    serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
  } else {
    throw new Error("Missing FIREBASE_CREDENTIALS in environment variables");
  }
} catch (err) {
  console.error("❌ Failed to load Firebase credentials:", err.message);
  process.exit(1);
}

// ✅ Initialize Firebase (Firestore + Auth only — no storage)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
    // ❌ Removed storageBucket to avoid billing issues
  });
  console.log("🔥 Firebase initialized successfully (no storage).");
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
