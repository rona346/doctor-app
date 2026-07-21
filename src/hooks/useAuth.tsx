import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { User, UserRole } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggingIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    console.log('[DEBUG AUTH] useEffect running. Setting up onAuthStateChanged listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[DEBUG AUTH] onAuthStateChanged callback triggered. firebaseUser:', firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : 'null');
      if (firebaseUser) {
        try {
          console.log('[DEBUG AUTH] Attempting to getDoc for users/' + firebaseUser.uid);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          console.log('[DEBUG AUTH] getDoc completed. Exists:', userDoc.exists());
          const isAdminEmail = firebaseUser.email === 'guptaronak810@gmail.com';
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('[DEBUG AUTH] User document found in Firestore:', userData);
            if (isAdminEmail && userData.role !== 'admin') {
              console.log('[DEBUG AUTH] User matches admin email but role is not admin in database. Upgrading role in Firestore...');
              const updatedUser = { ...userData, role: 'admin' as UserRole };
              await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser, { merge: true });
              console.log('[DEBUG AUTH] Upgrade complete.');
              setUser(updatedUser);
            } else {
              setUser(userData);
            }
          } else {
            console.log('[DEBUG AUTH] No document found for uid: ' + firebaseUser.uid + '. Searching by email instead...');
            const email = firebaseUser.email;
            let emailDocFound = false;

            if (email) {
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('email', '==', email));
              console.log('[DEBUG AUTH] Fetching documents by email: ' + email);
              const querySnapshot = await getDocs(q);
              console.log('[DEBUG AUTH] Email query complete. Matching documents found:', querySnapshot.size);

              if (!querySnapshot.empty) {
                emailDocFound = true;
                const existingDoc = querySnapshot.docs[0];
                const existingData = existingDoc.data();
                const existingId = existingDoc.id;
                console.log('[DEBUG AUTH] Matching document found by email. ID:', existingId);

                const updatedUser = {
                  ...existingData,
                  uid: firebaseUser.uid,
                  displayName: existingData.displayName || firebaseUser.displayName || 'New User',
                  photoURL: existingData.photoURL || firebaseUser.photoURL || '',
                } as User;

                console.log('[DEBUG AUTH] Saving document under new UID: ' + firebaseUser.uid);
                await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser);
                console.log('[DEBUG AUTH] setDoc under new UID complete.');

                if (existingId !== firebaseUser.uid) {
                  try {
                    console.log('[DEBUG AUTH] Deleting legacy user doc: ' + existingId);
                    await deleteDoc(doc(db, 'users', existingId));
                    console.log('[DEBUG AUTH] Deletion complete.');
                  } catch (deleteErr) {
                    console.error('[DEBUG AUTH] Failed to delete legacy user document:', deleteErr);
                  }
                }

                setUser(updatedUser);
              }
            }

            if (!emailDocFound) {
              console.log('[DEBUG AUTH] No existing document by UID or email. Creating brand-new patient account...');
              const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'New User',
                photoURL: firebaseUser.photoURL || '',
                role: isAdminEmail ? 'admin' : 'patient',
                createdAt: new Date().toISOString(),
              };

              console.log('[DEBUG AUTH] Saving brand-new patient document...');
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              console.log('[DEBUG AUTH] setDoc for brand-new patient complete.');
              setUser(newUser);
            }
          }
        } catch (error) {
          console.error('[DEBUG AUTH] Error during onAuthStateChanged Firestore operations:', error);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        console.log('[DEBUG AUTH] No firebaseUser authenticated. Setting user state to null.');
        setUser(null);
      }
      console.log('[DEBUG AUTH] Setting isLoggingIn to false and loading to false');
      setIsLoggingIn(false);
      setLoading(false);
      console.log('[DEBUG AUTH] onAuthStateChanged finished.');
    });

    return () => {
      console.log('[DEBUG AUTH] unsubscribing onAuthStateChanged listener.');
      unsubscribe();
    };
  }, []);

  const login = async () => {
    console.log('[DEBUG AUTH] login() function triggered. isLoggingIn:', isLoggingIn);
    if (isLoggingIn) {
      console.log('[DEBUG AUTH] login() call ignored because isLoggingIn is already true.');
      return;
    }
    console.log('[DEBUG AUTH] Setting isLoggingIn to true');
    setIsLoggingIn(true);

    console.log('[DEBUG AUTH] Setting 45-second watchdog timer...');
    const timeoutId = setTimeout(() => {
      console.log('[DEBUG AUTH] Watchdog timer fired. Forcing isLoggingIn to false...');
      setIsLoggingIn(false);
    }, 45000);

    try {
      console.log('[DEBUG AUTH] Launching signInWithPopup(auth, googleProvider)...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('[DEBUG AUTH] signInWithPopup promise resolved successfully! User UID:', result?.user?.uid);
      console.log('[DEBUG AUTH] Clearing watchdog timer.');
      clearTimeout(timeoutId);
    } catch (error: any) {
      console.log('[DEBUG AUTH] signInWithPopup promise REJECTED! Error object:', error);
      console.log('[DEBUG AUTH] Error code:', error?.code);
      console.log('[DEBUG AUTH] Error message:', error?.message);
      console.log('[DEBUG AUTH] Clearing watchdog timer.');
      clearTimeout(timeoutId);
      console.log('[DEBUG AUTH] Setting isLoggingIn to false inside catch block');
      setIsLoggingIn(false);
      
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Login popup request was cancelled due to a newer request.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the login popup.');
      } else if (error.code === 'auth/missing-or-invalid-nonce') {
        console.error('Login error: Duplicate credential / invalid nonce. Please refresh the page and try again.');
        alert('Authentication error: Duplicate session detected. Please refresh the page and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        console.error('Login error: Unauthorized Domain. Please add this domain to your Firebase Console > Authentication > Settings > Authorized Domains.');
        alert('Configuration Error: This domain is not authorized for Firebase Authentication. Please check the console for instructions.');
      } else {
        console.error('Login error:', error);
      }
    } finally {
      console.log('[DEBUG AUTH] login() finally block entered. clearing timeout (just in case) and isLoggingIn = false (just in case).');
      clearTimeout(timeoutId);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
