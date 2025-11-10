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
  // Support multiple ways to provide service account credentials:
  // 1) A local file next to this utils folder: ../serviceAccountKey.json
  // 2) A file at the repository root: serviceAccountKey.json
  // 3) An environment variable FIREBASE_CREDENTIALS that is either a path to a
  //    JSON file or a JSON string containing the service account object.
  const possiblePaths = [
    path.join(__dirname, "..", "serviceAccountKey.json"),
    path.join(process.cwd(), "serviceAccountKey.json"),
  ];

  let loaded = false;

  // 1) Try env var first — it may contain JSON or a path
  const envCred = process.env.FIREBASE_CREDENTIALS;
  if (envCred) {
    try {
      // If it looks like JSON, parse it directly
      if (envCred.trim().startsWith("{")) {
        serviceAccount = JSON.parse(envCred);
        loaded = true;
        console.log(`✅ Firebase service account loaded from FIREBASE_CREDENTIALS (env JSON)`);
      } else {
        // Treat as a path
        const p = envCred;
        const raw = readFileSync(p, "utf8");
        serviceAccount = JSON.parse(raw);
        loaded = true;
        console.log(`✅ Firebase service account loaded from FIREBASE_CREDENTIALS (file: ${p})`);
      }
    } catch (err) {
      console.warn("⚠️  FIREBASE_CREDENTIALS provided but could not be parsed as JSON or read as a file:", err.message);
    }
  }

  // 2) Try common file locations if env var didn't work
  if (!loaded) {
    for (const p of possiblePaths) {
      try {
        const raw = readFileSync(p, "utf8");
        serviceAccount = JSON.parse(raw);
        loaded = true;
        console.log(`✅ Firebase service account loaded from: ${p}`);
        break;
      } catch (err) {
        // ignore and continue
      }
    }
  }

  if (!loaded) {
    throw new Error("Service account key not found in any expected location or FIREBASE_CREDENTIALS is invalid");
  }

  // Fix escaped newlines in private key
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
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
