// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAwbVm2_Wck0U0LIeWRiKgbWzp3runTc-A",
  authDomain: "numaparfume-6e1b6.firebaseapp.com",
  projectId: "numaparfume-6e1b6",
  storageBucket: "numaparfume-6e1b6.firebasestorage.app",
  messagingSenderId: "990987143916",
  appId: "1:990987143916:web:cb0892c57b06d3fa9db3c9",
  measurementId: "G-HF3JLEMKHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;