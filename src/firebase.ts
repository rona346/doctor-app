import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7_KJ7jtUUKg5eA9zFzYCVc_S-qp2J1Jg",
  authDomain: "doctor-app-599e1.firebaseapp.com",
  projectId: "doctor-app-599e1",
  storageBucket: "doctor-app-599e1.firebasestorage.app",
  messagingSenderId: "582242350744",
  appId: "1:582242350744:web:386e2fedf821879c4942ed",
  measurementId: "G-Q7G0M51PKK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Failed to set persistence:', err);
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
