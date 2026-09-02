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

// Real Google Sign In Handler — no hardcoded fallback, real error propagation
export async function signInWithGoogle(): Promise<{ user: any; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user.email) {
      return { user: null, error: 'Google sign-in succeeded but no email returned — check OAuth scopes.' };
    }
    // Sync with Either backend server — server validates uid+email
    const syncRes = await fetch("/api/firebase/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        avatarUrl: user.photoURL || "",
        provider: "google",
      }),
    });
    const syncData = await syncRes.json();
    if (!syncRes.ok || !syncData.success) {
      return { user: null, error: syncData.error || 'Backend Firebase sync failed' };
    }
    return { user: syncData.user || user };
  } catch (err: any) {
    const msg = err?.message || String(err);
    // Firebase error codes: auth/popup-closed-by-user, auth/cancelled-popup-request, etc.
    console.error("Firebase Google sign-in failed:", msg);
    return { user: null, error: msg };
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