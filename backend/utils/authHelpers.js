import admin from "firebase-admin";

const auth = admin.auth();
const db = admin.firestore();

/**
 * Utility to create auth users for existing institutions (one-time migration)
 */
export const createAuthForInstitutions = async () => {
  try {
    console.log('🔐 Creating Auth users for all institutions...');
    
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

        // Create user document
        await db.collection("users").doc(user.uid).set({
          uid: user.uid,
          email: email,
          role: 'institution',
          institutionName: institution.name,
          createdAt: new Date().toISOString(),
          emailVerified: true
        });

        console.log(`✅ Created auth for: ${institution.name}`);
      } catch (error) {
        console.error(`❌ Error creating auth for ${institution.name}:`, error.message);
      }
    }
    
    console.log('🎉 Auth creation completed for all institutions!');
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
};

/**
 * Utility to clean up duplicate institutions
 */
export const cleanupInstitutions = async () => {
  try {
    console.log('🧹 Final cleanup of institutions...');
    
    const institutionsSnapshot = await db.collection('institutions').get();
    const institutions = institutionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${institutions.length} institutions total`);
    
    const institutionsByName = {};
    institutions.forEach(inst => {
      if (!institutionsByName[inst.name]) {
        institutionsByName[inst.name] = [];
      }
      institutionsByName[inst.name].push(inst);
    });
    
    let deletedCount = 0;
    const keepInstitutions = [];
    
    for (const [name, instList] of Object.entries(institutionsByName)) {
      const validInstitutions = instList.filter(inst => 
        inst.email && inst.email.includes('@') && inst.email.includes('.')
      );
      
      if (validInstitutions.length > 0) {
        const keep = validInstitutions[0];
        keepInstitutions.push(keep);
        
        const deleteList = instList.filter(inst => inst.id !== keep.id);
        for (const delInst of deleteList) {
          await db.collection('institutions').doc(delInst.id).delete();
          deletedCount++;
        }
      } else {
        for (const delInst of instList) {
          await db.collection('institutions').doc(delInst.id).delete();
          deletedCount++;
        }
      }
    }
    
    console.log(`🎉 Cleanup completed! Deleted ${deletedCount} institutions.`);
    return keepInstitutions;
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};