// backend/createAuthUsers.js
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

async function createAuthUsers() {
  try {
    console.log('🔐 Creating Auth users for existing institutions...');
    
    // Get all institutions from Firestore
    const institutionsSnapshot = await db.collection('institutions').get();
    
    for (const doc of institutionsSnapshot.docs) {
      const institution = doc.data();
      const institutionId = doc.id;
      
      console.log(`Processing: ${institution.name} (${institution.email})`);
      
      try {
        // Check if user already exists
        try {
          await auth.getUserByEmail(institution.email);
          console.log(`✅ User already exists for: ${institution.email}`);
          continue;
        } catch (error) {
          // User doesn't exist, create them
        }
        
        // Create auth user
        const user = await auth.createUser({
          email: institution.email,
          password: 'password123', // Default password
          displayName: institution.name,
          emailVerified: true // Skip email verification for testing
        });
        
        console.log(`✅ Created auth user: ${user.uid} for ${institution.name}`);
        
      } catch (error) {
        console.error(`❌ Error creating user for ${institution.email}:`, error.message);
      }
    }
    
    console.log('🎉 Auth user creation completed!');
    console.log('📧 You can now login with institution emails and password: "password123"');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

createAuthUsers();