import { useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../firebase';

export default function FirestoreTest() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection successful.");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  return null;
}
