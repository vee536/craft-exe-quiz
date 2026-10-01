import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

function initFirebase() {
  if (getApps().length > 0) {
    db = getFirestore();
    return;
  }

  const keyPath = join(__dirname, 'serviceAccountKey.json');

  if (existsSync(keyPath)) {
    try {
      const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase initialized using serviceAccountKey.json');
    } catch (err) {
      console.error('❌ Error reading serviceAccountKey.json:', err.message);
      throw err;
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase initialized using FIREBASE_SERVICE_ACCOUNT env');
    } catch (err) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT env:', err.message);
      throw err;
    }
  } else {
    throw new Error(
      'Firebase credentials not found. Place serviceAccountKey.json in server/ OR set FIREBASE_SERVICE_ACCOUNT env variable.'
    );
  }

  db = getFirestore();
}

initFirebase();

export { db };
