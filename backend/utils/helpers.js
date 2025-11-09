import { db, auth } from './firebase.js';

/**
 * Utility to check if a document exists
 */
export const documentExists = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists;
  } catch (error) {
    console.error(`Error checking document ${collection}/${docId}:`, error);
    return false;
  }
};

/**
 * Utility to get document data
 */
export const getDocument = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error(`Error getting document ${collection}/${docId}:`, error);
    return null;
  }
};

/**
 * Utility to create a document with timestamp
 */
export const createDocument = async (collection, data, docId = null) => {
  try {
    const documentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (docId) {
      await db.collection(collection).doc(docId).set(documentData);
      return docId;
    } else {
      const docRef = await db.collection(collection).add(documentData);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error creating document in ${collection}:`, error);
    throw error;
  }
};

/**
 * Utility to update a document with timestamp
 */
export const updateDocument = async (collection, docId, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await db.collection(collection).doc(docId).update(updateData);
    return true;
  } catch (error) {
    console.error(`Error updating document ${collection}/${docId}:`, error);
    throw error;
  }
};

/**
 * Utility to delete a document
 */
export const deleteDocument = async (collection, docId) => {
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting document ${collection}/${docId}:`, error);
    throw error;
  }
};

/**
 * Utility to query documents with filters
 */
export const queryDocuments = async (collection, conditions = []) => {
  try {
    let query = db.collection(collection);
    
    conditions.forEach(condition => {
      query = query.where(condition.field, condition.operator, condition.value);
    });
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying collection ${collection}:`, error);
    throw error;
  }
};