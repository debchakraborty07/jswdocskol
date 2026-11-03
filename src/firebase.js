import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBvG0B-6qn8WP4CwsoDIj-XSmgypIfRj4M",
    authDomain: "jswdocskolkata.firebaseapp.com",
    projectId: "jswdocskolkata",
    storageBucket: "jswdocskolkata.firebasestorage.app",
    messagingSenderId: "52994190728",
    appId: "1:52994190728:web:b894081ca1ec74199cde3d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Explicitly targeting the database instance created in Mumbai
export const db = getFirestore(app, "default");
export const storage = getStorage(app);
export default app;