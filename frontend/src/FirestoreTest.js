import React, { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const FirestoreTest = () => {
  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

  return <div>Check your console for Firestore output</div>;
};

export default FirestoreTest;
