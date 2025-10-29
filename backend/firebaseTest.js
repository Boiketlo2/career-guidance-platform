import admin from "firebase-admin";
import fs from "fs";

// Path to your service account key
const serviceAccount = JSON.parse(
  fs.readFileSync("serviceAccountKey.json", "utf8")
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore test
const db = admin.firestore();

// Simple test function
async function testFirebaseConnection() {
  try {
    // Create a test document in Firestore
    const docRef = db.collection("testCollection").doc("connectionTest");
    await docRef.set({ success: true, timestamp: new Date() });

    // Read it back
    const doc = await docRef.get();
    if (doc.exists) {
      console.log("✅ Firebase connection successful!");
      console.log("Document data:", doc.data());
    } else {
      console.log("⚠️ Firebase connected but document not found.");
    }
  } catch (err) {
    console.error("❌ Firebase connection failed:", err);
  }
}

// Run the test
testFirebaseConnection();
