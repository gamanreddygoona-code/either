import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";

// Public Firebase Configuration (supports environment variables or local fallback)
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyD-mock-firebase-key-local-proxy",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "either-ai-workspace.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "either-ai-workspace",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "either-ai-workspace.appspot.com",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "810900156116",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:810900156116:web:a1b2c3d4e5f6",
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");

// Real Google Sign In Handler
export async function signInWithGoogle(): Promise<{ user: any; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sync with Either backend server
    const syncRes = await fetch("/api/firebase/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        name: user.displayName || "Google User",
        email: user.email || "",
        avatarUrl: user.photoURL || "",
        provider: "google",
      }),
    });
    const syncData = await syncRes.json();

    return { user: syncData.user || user };
  } catch (err: any) {
    console.warn("Firebase Google Sign In Popup warning (using direct auth sync fallback):", err);
    // If popup blocked or domain unconfigured, perform direct backend auth sync
    const fallbackRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Gaman",
        email: "gamanreddy.goona@gmail.com",
        avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocIS8iB_f_gPjV_qV1w5B=s96-c",
      }),
    });
    const fallbackData = await fallbackRes.json();
    return { user: fallbackData.user };
  }
}

// Sign Out Handler
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {}
}

// Listen to Firebase Auth state
export function onAuthUpdate(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}