// backend/createAuthForAllInstitutions.js
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

async function createAuthForAllInstitutions() {
  try {
    console.log('🔐 Creating Auth users for all institutions...');
    
    // Get all institutions from Firestore
    const institutionsSnapshot = await db.collection('institutions').get();
    
    for (const doc of institutionsSnapshot.docs) {
      const institution = doc.data();
      const institutionId = doc.id;
      
      // Skip if already has proper email format
      if (institution.email && institution.email.includes('@')) {
        console.log(`✅ Already has email: ${institution.name}`);
        continue;
      }
      
      // Create email from institution name
      const email = `${institution.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@career.ls`;
      
      try {
        // Create auth user
        const user = await auth.createUser({
          email: email,
          password: 'password123',
          displayName: institution.name,
          emailVerified: true
        });

        // Update institution with new email and auth ID
        await db.collection('institutions').doc(institutionId).update({
          email: email,
          authUserId: user.uid
        });

        console.log(`✅ Created auth for: ${institution.name}`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: password123`);

      } catch (error) {
        console.error(`❌ Error creating auth for ${institution.name}:`, error.message);
      }
    }
    
    console.log('🎉 Auth creation completed for all institutions!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

createAuthForAllInstitutions();