import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";

// Configuration from environment variables
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyBPZKwiyGifeOBDYzKXDb3oy3v3IV25QIk",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "gym-tracker-3ba2a.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "gym-tracker-3ba2a",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "gym-tracker-3ba2a.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "146511895291",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:146511895291:web:5b3384cdde02f11241ee5e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore - uses the "(default)" database of the project
const customDbId = metaEnv.VITE_FIREBASE_DATABASE_ID;
const db = customDbId && customDbId !== "(default)"
  ? getFirestore(app, customDbId)
  : getFirestore(app);
const auth = getAuth(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
};
