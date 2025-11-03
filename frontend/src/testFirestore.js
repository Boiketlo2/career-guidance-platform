import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function testFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "institutions"));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Fetched data from Firestore:", data);
  } catch (error) {
    console.error("Firestore error:", error);
  }
}
