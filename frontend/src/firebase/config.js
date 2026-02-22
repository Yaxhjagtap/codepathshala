import { initializeApp } from "firebase/app";
// Analytics is OPTIONAL – safe to remove in hackathons
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfr4qgbXGpLTnkj03qztq4N9F-Ha74d_A",
  authDomain: "codepathshala-6e08d.firebaseapp.com",
  projectId: "codepathshala-6e08d",
  storageBucket: "codepathshala-6e08d.firebasestorage.app",
  messagingSenderId: "321930509374",
  appId: "1:321930509374:web:f4e28b9690a717ab2aa56f",
  measurementId: "G-7NMXYZVRWL"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// ❌ Optional – remove to avoid SSR / localhost issues
// export const analytics = getAnalytics(app);
