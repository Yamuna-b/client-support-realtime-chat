import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const isDevelopment = process.env.NODE_ENV === 'development';
const useEmulators = process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true';

if (isDevelopment && useEmulators) {
  try {
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    console.log('🔥 Firebase emulators connected');
  } catch (error) {
    console.warn('Firebase emulators connection failed:', error);
  }
}

const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing Firebase configuration fields:', missingFields);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
  }
  
  console.log('✅ Firebase configuration validated');
};

validateConfig();

export default app;
