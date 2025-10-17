import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLUeODELyULsatvZD3TzMZlZ3YY3tUZZs",
  authDomain: "udvlesl-67df7.firebaseapp.com",
  projectId: "udvlesl-67df7",
  storageBucket: "udvlesl-67df7.firebasestorage.app",
  messagingSenderId: "877724350811",
  appId: "1:877724350811:web:d1a390c7f83098145b427e",
  measurementId: "G-DCB55YFRDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Admin email whitelist - Only these emails can access the admin panel
export const ADMIN_EMAILS = [
  "admin@example.com", // Replace with your actual admin email
];
