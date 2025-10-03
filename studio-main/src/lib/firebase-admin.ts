import * as admin from 'firebase-admin';

// This function will throw a clear error if the environment variables are missing
function initializeFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set in .env.local');
  }

  // Check if the app is already initialized to prevent errors on hot reloads
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
  return admin;
}

// Export the initialized admin instance
export const adminAuth = initializeFirebaseAdmin().auth();
export const adminDb = initializeFirebaseAdmin().firestore; // If you decide to use Firestore later
