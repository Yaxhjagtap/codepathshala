import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "./config";

export const auth = getAuth(app);
export const db = getFirestore(app); // Add Firestore export here

export const getUserLabProgress = async (userId, labId) => {
  try {
    const progressDoc = await getDoc(doc(db, "users", userId, "labProgress", labId));
    if (progressDoc.exists()) {
      return progressDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting lab progress:", error);
    return null;
  }
};

export const getUserCompletedLabs = async (userId) => {
  try {
    const completedQuery = query(
      collection(db, "users", userId, "completedLabs")
    );
    const completedSnapshot = await getDocs(completedQuery);
    const completedLabs = completedSnapshot.docs.map(doc => doc.id);
    return completedLabs;
  } catch (error) {
    console.error("Error getting completed labs:", error);
    return [];
  }
};