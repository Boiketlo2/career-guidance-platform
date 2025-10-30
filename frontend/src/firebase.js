import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChdty11F_lDBCh82ADRwwv_L6-YZ7hrD8",
  authDomain: "career-guidance-platform-a368e.firebaseapp.com",
  projectId: "career-guidance-platform-a368e",
  storageBucket: "career-guidance-platform-a368e.appspot.com", // ✅ fixed
  messagingSenderId: "158743703595",
  appId: "1:158743703595:web:399ceab05a120424c9fa6e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
