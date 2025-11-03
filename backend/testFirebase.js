import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

// Choose based on your .env setup 👇

// ✅ If you’re using a JSON file path
const serviceAccount = JSON.parse(
  readFileSync(process.env.FIREBASE_CREDENTIALS, "utf8")
);

// ❌ OR if you’re storing JSON directly in .env, comment the above and use:
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Test connection
async function testFirestore() {
  try {
    console.log("✅ Firebase initialized successfully!");

    // Add sample document
    const docRef = await db.collection("testCollection").add({
      message: "Hello from Node.js backend!",
      timestamp: new Date(),
    });

    console.log("📝 Document written with ID:", docRef.id);

    // Read documents
    const snapshot = await db.collection("testCollection").get();
    console.log("📂 Current documents in testCollection:");
    snapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (error) {
    console.error("❌ Error connecting to Firestore:", error);
  }
}

testFirestore();
