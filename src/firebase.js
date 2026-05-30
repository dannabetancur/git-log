import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-q_bYCx0_yzpLC_KnS7f2qZwUF42tWrM",
  authDomain: "gym-log-657f7.firebaseapp.com",
  projectId: "gym-log-657f7",
  storageBucket: "gym-log-657f7.firebasestorage.app",
  messagingSenderId: "721017817471",
  appId: "1:721017817471:web:63741fcc648128a304724a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
