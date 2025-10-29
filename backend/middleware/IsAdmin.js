// middleware/IsAdmin.js
import admin from "firebase-admin";

const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized: Missing token" });

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await admin.firestore().collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return res.status(403).json({ error: "User not found" });

    const user = userDoc.data();
    if (user.role !== "admin") return res.status(403).json({ error: "Forbidden: Admins only" });

    req.user = { uid: decoded.uid, ...user };
    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default isAdmin;
