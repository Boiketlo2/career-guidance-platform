import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine service account
let serviceAccount;
try {
  const possiblePaths = [
    path.join(__dirname, "..", "serviceAccountKey.json"),
    path.join(process.cwd(), "serviceAccountKey.json"),
    process.env.FIREBASE_CREDENTIALS
  ];

  let serviceAccountPath = null;
  for (const p of possiblePaths) {
    try {
      if (p && readFileSync(p, "utf8")) {
        serviceAccountPath = p;
        break;
      }
    } catch { /* ignore */ }
  }

  if (!serviceAccountPath) {
    throw new Error("Service account key not found in any expected location");
  }

  // Parse service account JSON
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

  // Fix escaped newlines in private key
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  console.log(`✅ Firebase service account loaded from: ${serviceAccountPath}`);
} catch (err) {
  console.error("❌ Error loading Firebase service account:", err.message);
  console.log("💡 Ensure serviceAccountKey.json exists and is valid, or set FIREBASE_CREDENTIALS in .env");
  process.exit(1);
}

// Prevent re-initialization
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin SDK initialized successfully");
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err.message);
    console.log("💡 Check your service account key and project permissions");
    process.exit(1);
  }
}

// Firestore & Auth instances
export const db = admin.firestore();
export const auth = admin.auth();
export { admin };

// Test connection immediately
(async () => {
  try {
    const testRef = db.collection("connectionTests").doc("serverStartup");
    await testRef.set({
      message: "Server connection test",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "success"
    });

    const doc = await testRef.get();
    if (doc.exists) console.log("✅ Firestore connection verified!");
    else console.log("⚠️ Firestore connected but test document not found");

    await auth.listUsers(1);
    console.log("✅ Firebase Auth connection verified!");
    
    // Cleanup
    await testRef.delete();
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error.message);
    console.log("💡 Make sure your service account has proper permissions and correct project ID");
    process.exit(1);
  }
})();
