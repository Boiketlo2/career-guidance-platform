// Firestore Institution Schema Reference
export const InstituteSchema = {
  name: 'string',
  email: 'string',
  location: 'string',
  type: 'string', // 'Public', 'Private'
  description: 'string?',
  website: 'string?',
  contactEmail: 'string?',
  phone: 'string?',
  authUserId: 'string', // Linked Firebase Auth UID
  status: 'string', // 'active', 'inactive'
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  faculties: 'array?', // Array of faculty IDs
  admissionOpen: 'boolean'
};

export default InstituteSchema;