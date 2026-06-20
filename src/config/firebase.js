import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAkIgrX6y-nOXrrRTA-jnv3X_fy86jHxQY",
  authDomain: "asha-incentive.firebaseapp.com",
  projectId: "asha-incentive",
  storageBucket: "asha-incentive.firebasestorage.app",
  messagingSenderId: "358789435926",
  appId: "1:358789435926:web:b7d62328bff8bbce8c5b37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
