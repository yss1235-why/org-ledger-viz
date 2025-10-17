import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please check your .env file and ensure all Firebase configuration variables are set.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Admin email whitelist from environment variables
const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || '';
export const ADMIN_EMAILS = adminEmailsString
  .split(',')
  .map((email: string) => email.trim())
  .filter((email: string) => email.length > 0);

// Warn if no admin emails are configured
if (ADMIN_EMAILS.length === 0) {
  console.warn(
    '⚠️  No admin emails configured! Set VITE_ADMIN_EMAILS in your .env file.\n' +
    'Example: VITE_ADMIN_EMAILS=admin@example.com,another@example.com'
  );
}

// Log admin emails in development (for debugging)
if (import.meta.env.DEV) {
  console.log('🔐 Configured admin emails:', ADMIN_EMAILS);
}
