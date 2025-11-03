// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChdty11F_lDBCh82ADRwwv_L6-YZ7hrD8",
  authDomain: "career-guidance-platform-a368e.firebaseapp.com",
  projectId: "career-guidance-platform-a368e",
  storageBucket: "career-guidance-platform-a368e.firebasestorage.app",
  messagingSenderId: "1066956529886",
  appId: "1:1066956529886:web:8a5a7c3b9a3e1b1f4f8b37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;