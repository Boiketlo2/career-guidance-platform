// backend/linkInstitutionsWithAuth.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve('./serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function linkInstitutionsWithAuth() {
  try {
    console.log('🔗 Linking existing institutions with auth users...');
    
    // Get all institutions from Firestore
    const institutionsSnapshot = await db.collection('institutions').get();
    
    for (const doc of institutionsSnapshot.docs) {
      const institution = doc.data();
      const oldInstitutionId = doc.id;
      
      console.log(`Processing: ${institution.name} (${institution.email})`);
      
      try {
        // Find the auth user by email
        const user = await auth.getUserByEmail(institution.email);
        console.log(`✅ Found auth user: ${user.uid} for ${institution.email}`);
        
        // Create a new institution document with the auth user ID
        await db.collection('institutions').doc(user.uid).set({
          ...institution,
          linkedAt: new Date()
        });
        
        console.log(`✅ Created new institution document with ID: ${user.uid}`);
        
        // Optional: Delete the old institution document
        // await db.collection('institutions').doc(oldInstitutionId).delete();
        // console.log(`🗑️ Deleted old institution document: ${oldInstitutionId}`);
        
      } catch (error) {
        console.error(`❌ Error finding auth user for ${institution.email}:`, error.message);
      }
    }
    
    console.log('🎉 Institution linking completed!');
    console.log('🔑 You can now login with the institution emails');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

linkInstitutionsWithAuth();