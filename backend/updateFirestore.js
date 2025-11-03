// updateFirestore.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Read service account file
const serviceAccountPath = path.resolve('./serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateLimkokwing() {
  const limkokwingRef = db.collection('institutions').doc('limkokwing');

  await limkokwingRef.update({
    email: 'info@limkokwing.ac.ls',
    contact: '+266 222 12345',
    address: 'Maseru, Lesotho'
  });

  console.log('✅ Limkokwing document updated successfully!');
}

updateLimkokwing().catch(console.error);
