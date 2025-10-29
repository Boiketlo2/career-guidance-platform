import { admin } from "../config/Firebase.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // ✅ Optional: restrict to specific admin emails
    // const allowedAdmins = ["admin@example.com"];
    // if (!allowedAdmins.includes(decodedToken.email)) {
    //   return res.status(403).json({ error: "Access denied: not an admin" });
    // }

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
