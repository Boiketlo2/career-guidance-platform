// backend/finalCleanup.js
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

async function finalCleanup() {
  try {
    console.log('🧹 Final cleanup of institutions...');
    
    // Get all institutions
    const institutionsSnapshot = await db.collection('institutions').get();
    const institutions = institutionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${institutions.length} institutions total`);
    
    // Group by name to find duplicates
    const institutionsByName = {};
    institutions.forEach(inst => {
      if (!institutionsByName[inst.name]) {
        institutionsByName[inst.name] = [];
      }
      institutionsByName[inst.name].push(inst);
    });
    
    // Delete duplicates and keep only institutions with proper emails
    let deletedCount = 0;
    const keepInstitutions = [];
    
    for (const [name, instList] of Object.entries(institutionsByName)) {
      console.log(`\n🏫 ${name}: ${instList.length} entries`);
      
      // Find institutions with proper email format
      const validInstitutions = instList.filter(inst => 
        inst.email && inst.email.includes('@') && inst.email.includes('.')
      );
      
      if (validInstitutions.length > 0) {
        // Keep the first valid institution
        const keep = validInstitutions[0];
        keepInstitutions.push(keep);
        console.log(`   ✅ Keeping: ${keep.id} (${keep.email})`);
        
        // Delete all others (including invalid ones)
        const deleteList = instList.filter(inst => inst.id !== keep.id);
        for (const delInst of deleteList) {
          console.log(`   🗑️ Deleting: ${delInst.id} (${delInst.email || 'no email'})`);
          await db.collection('institutions').doc(delInst.id).delete();
          deletedCount++;
        }
      } else {
        // No valid institutions, delete all
        console.log(`   ❌ No valid email, deleting all entries`);
        for (const delInst of instList) {
          await db.collection('institutions').doc(delInst.id).delete();
          deletedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Cleanup completed! Deleted ${deletedCount} institutions.`);
    console.log(`📊 Remaining institutions: ${keepInstitutions.length}`);
    
    // Show remaining institutions with their auth status
    console.log('\n🔐 Remaining Institutions with Auth Status:');
    console.log('==========================================');
    
    for (const inst of keepInstitutions) {
      try {
        const user = await auth.getUserByEmail(inst.email);
        console.log(`✅ ${inst.name}`);
        console.log(`   📧 ${inst.email}`);
        console.log(`   🔑 Password: password123`);
        console.log(`   🆔 Auth ID: ${user.uid}`);
        console.log(`   📍 Location: ${inst.location || 'Not specified'}`);
        console.log('   ---');
      } catch (error) {
        console.log(`❌ ${inst.name} - No auth user found for ${inst.email}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

finalCleanup();