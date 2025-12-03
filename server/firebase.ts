import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRdgyKycwm7Ldl1YHn_QHsqv2PUMbBhKE",
  authDomain: "raiaurashop-79330.firebaseapp.com",
  projectId: "raiaurashop-79330",
  storageBucket: "raiaurashop-79330.firebasestorage.app",
  messagingSenderId: "686727027273",
  appId: "1:686727027273:web:4a1c414c649dbaaf85fd98",
  measurementId: "G-W003WB63DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
