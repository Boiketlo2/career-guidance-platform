import { db, auth } from "../utils/firebase.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { 
  validateUserRegistration, 
  validateUserLogin 
} from "../middleware/validation.js";
import { sendVerificationEmail } from "../utils/emailService.js";

/**
 * ✅ Register a new user (student, company, institution, or admin)
 */
export const registerUser = [
  validateUserRegistration,
  asyncHandler(async (req, res) => {
    const { 
      email, 
      password, 
      name, 
      role, 
      institutionName, 
      companyName, 
      studentId, 
      phone, 
      location,
      established,
      faculties,
      website,
      industry
    } = req.body;

    // 🔍 Check if user already exists
    const existingUserSnap = await db.collection("users").where("email", "==", email).get();
    if (!existingUserSnap.empty) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists"
      });
    }

    // 🧠 Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || institutionName || companyName,
      emailVerified: false,
    });

    // 🧱 Build user object
    const userData = {
      uid: userRecord.uid,
      email,
      role,
      name: name || institutionName || companyName,
      phone: phone || "",
      location: location || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: false,
      status: "active",
    };

    // 🗂 Save main user document
    await db.collection("users").doc(userRecord.uid).set(userData);

    // 🧩 Role-specific records
    if (role === "institution") {
      await db.collection("institutions").doc(userRecord.uid).set({
        name: institutionName || name,
        email,
        location: location || "",
        contact: phone || "",
        authUserId: userRecord.uid,
        status: "active",
        established: established || null,
        faculties: faculties || [],
        website: website || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (role === "company") {
      await db.collection("companies").doc(userRecord.uid).set({
        name: companyName || name,
        email,
        location: location || "",
        contact: phone || "",
        authUserId: userRecord.uid,
        status: "Approved",
        approved: true,
        industry: industry || "",
        website: website || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (role === "student") {
      await db.collection("students").doc(userRecord.uid).set({
        name,
        email,
        studentId: studentId || "",
        phone: phone || "",
        location: location || "",
        authUserId: userRecord.uid,
        status: "active",
        applications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (role === "admin") {
      // ✅ Admin collection
      await db.collection("admins").doc(userRecord.uid).set({
        name: name || "Admin",
        email,
        authUserId: userRecord.uid,
        role: "admin",
        permissions: ["manage_users", "approve_companies", "view_reports"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // ✉️ Send email verification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const verificationLink = `${process.env.CLIENT_URL}/verify-email?uid=${userRecord.uid}`;
      await sendVerificationEmail(email, verificationLink, name || institutionName || companyName);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role,
      },
    });
  }),
];

/**
 * ✅ Login user (includes admin)
 */
export const loginUser = [
  validateUserLogin,
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "Token is required" });
    }

    // 🔍 Verify token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 🔎 Fetch user record
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userData = userDoc.data();

    // 🔧 Merge role-specific data
    let profileData = {};
    const roleCollectionMap = {
      student: "students",
      company: "companies",
      institution: "institutions",
      admin: "admins",
    };

    if (userData.role && roleCollectionMap[userData.role]) {
      const subDoc = await db.collection(roleCollectionMap[userData.role]).doc(uid).get();
      if (subDoc.exists) profileData = subDoc.data();
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: { ...userData, ...profileData },
    });
  }),
];

/**
 * ✅ Get user profile by UID
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const { uid } = req.params;

  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const userData = userDoc.data();
  let profileData = {};

  const roleCollectionMap = {
    student: "students",
    company: "companies",
    institution: "institutions",
    admin: "admins",
  };

  if (userData.role && roleCollectionMap[userData.role]) {
    const subDoc = await db.collection(roleCollectionMap[userData.role]).doc(uid).get();
    if (subDoc.exists) profileData = subDoc.data();
  }

  return res.status(200).json({
    success: true,
    user: { ...userData, ...profileData },
  });
});

/**
 * ✅ Update user profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const updateData = req.body;

  if (req.user.uid !== uid) {
    return res.status(403).json({ success: false, error: "Can only update your own profile" });
  }

  const updatedData = {
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  await db.collection("users").doc(uid).update(updatedData);

  const role = req.user.role;
  const roleMap = {
    student: "students",
    company: "companies",
    institution: "institutions",
    admin: "admins",
  };

  if (role && roleMap[role]) {
    await db.collection(roleMap[role]).doc(uid).update(updatedData);
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

/**
 * ✅ Verify email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { uid } = req.params;

  await db.collection("users").doc(uid).update({
    emailVerified: true,
    updatedAt: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});
