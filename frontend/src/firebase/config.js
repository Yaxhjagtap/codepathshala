import { initializeApp } from "firebase/app";
// Analytics is OPTIONAL – safe to remove in hackathons
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCgqUTGB-aF3G12Ck-ibYfKs4qhV_5Lm3M",
  authDomain: "codepathshala-6f9f4.firebaseapp.com",
  projectId: "codepathshala-6f9f4",
  storageBucket: "codepathshala-6f9f4.firebasestorage.app",
  messagingSenderId: "787528605413",
  appId: "1:787528605413:web:32eed41cf5b7cb56223e0c",
  measurementId: "G-BJFWN5CHMQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// ❌ Optional – remove to avoid SSR / localhost issues
// export const analytics = getAnalytics(app);
