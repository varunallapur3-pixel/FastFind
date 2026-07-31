import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForFastFindLocalDev',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'fastfind-ai.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'fastfind-ai',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'fastfind-ai.appspot.com',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Initialize Firebase app if not initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
