import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from "firebase/auth";

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
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Email Link Authentication settings
const actionCodeSettings = {
  // URL to redirect to after email link is clicked
  url: 'https://raiaurashop-1.onrender.com/login',
  handleCodeInApp: true,
};

// Send sign-in link to email
export async function sendEmailLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // Save email to localStorage to complete sign-in after redirect
  window.localStorage.setItem('emailForSignIn', email);
}

// Check if current URL is a sign-in email link
export function isEmailLink(url: string): boolean {
  return isSignInWithEmailLink(auth, url);
}

// Complete sign-in with email link
export async function completeEmailSignIn(email: string, url: string) {
  const result = await signInWithEmailLink(auth, email, url);
  // Clear the saved email
  window.localStorage.removeItem('emailForSignIn');
  return result;
}
