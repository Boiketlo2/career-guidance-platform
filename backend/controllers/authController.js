import { auth, db } from "../utils/firebase.js";

/**
 * Register a new user (student or company)
 */
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Store user info in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "User registered successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login: Verify Firebase token from client
 */
export const loginUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Missing token" });

    // Verify ID token from client
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user data
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Login successful",
      user: userDoc.data(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: error.message });
  }
};

/**
 * Get current user profile (by UID)
 */
export const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) return res.status(404).json({ message: "User not found" });

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};
