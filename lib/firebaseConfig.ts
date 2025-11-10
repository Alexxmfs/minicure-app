// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAritJUyLHeiU8LcuZhk1etx_OifA6OY6s",
  authDomain: "manicure-agenda-14c69.firebaseapp.com",
  projectId: "manicure-agenda-14c69",
  storageBucket: "manicure-agenda-14c69.firebasestorage.app",
  messagingSenderId: "347283173367",
  appId: "1:347283173367:web:4debd8bd4cad6e275408f2",
  measurementId: "G-LJDS7DGXBW"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
