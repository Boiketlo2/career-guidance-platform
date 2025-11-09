import admin from "firebase-admin";

// 🔹 Helper: Verify token and get user
export const verifyToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw { status: 403, message: "No token provided" };
  }
  const token = authHeader.split(" ")[1];
  const decoded = await admin.auth().verifyIdToken(token);
  const userDoc = await admin.firestore().collection("users").doc(decoded.uid).get();
  if (!userDoc.exists) throw { status: 403, message: "User not found" };
  return { uid: decoded.uid, ...userDoc.data() };
};

// ============================
// 🔹 STUDENT AUTHORIZATION
// ============================

export const isStudent = async (req, res, next) => {
  try {
    const user = await verifyToken(req.headers.authorization);
    if (user.role !== "student") return res.status(403).json({ error: "Forbidden: Students only" });
    req.user = user;
    next();
  } catch (err) {
    console.error("isStudent error:", err.message || err);
    res.status(err.status || 401).json({ error: err.message || "Invalid or expired token" });
  }
};

export const isStudentOwner = async (req, res, next) => {
  try {
    const user = await verifyToken(req.headers.authorization);
    if (user.role !== "student") return res.status(403).json({ error: "Forbidden: Students only" });

    if ((req.params.studentId && req.params.studentId !== user.uid) ||
        (req.body.studentId && req.body.studentId !== user.uid)) {
      return res.status(403).json({ error: "Forbidden: You can only access your own resources" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("isStudentOwner error:", err.message || err);
    res.status(err.status || 401).json({ error: err.message || "Invalid or expired token" });
  }
};

// ============================
// 🔹 ADMIN / INSTITUTION / COMPANY
// ============================

export const isAdmin = async (req, res, next) => {
  try {
    const user = await verifyToken(req.headers.authorization);
    if (user.role !== "admin") return res.status(403).json({ error: "Forbidden: Admins only" });
    req.user = user;
    next();
  } catch (err) {
    console.error("isAdmin error:", err.message || err);
    res.status(err.status || 401).json({ error: err.message || "Invalid or expired token" });
  }
};

export const isInstitution = async (req, res, next) => {
  try {
    const user = await verifyToken(req.headers.authorization);
    if (user.role !== "institution") return res.status(403).json({ error: "Forbidden: Institutions only" });
    req.user = user;
    next();
  } catch (err) {
    console.error("isInstitution error:", err.message || err);
    res.status(err.status || 401).json({ error: err.message || "Invalid or expired token" });
  }
};

export const isCompany = async (req, res, next) => {
  try {
    const user = await verifyToken(req.headers.authorization);
    if (user.role !== "company") return res.status(403).json({ error: "Forbidden: Companies only" });
    req.user = user;
    next();
  } catch (err) {
    console.error("isCompany error:", err.message || err);
    res.status(err.status || 401).json({ error: err.message || "Invalid or expired token" });
  }
};
