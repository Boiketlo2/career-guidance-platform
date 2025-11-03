// utils/firebase.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = JSON.parse(
  readFileSync(process.env.FIREBASE_CREDENTIALS, "utf8")
);

// ✅ Prevent re-initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firestore instance
export const db = admin.firestore();
export const auth = admin.auth();

// 🔥 Test Firestore connection immediately
(async () => {
  try {
    const snapshot = await db.collection("serverTest").limit(1).get();
    console.log(
      `🔥 Firebase initialized successfully! Found ${snapshot.size} test documents.`
    );
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
  }
})();
