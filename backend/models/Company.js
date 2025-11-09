// Firestore Company Schema Reference
export const CompanySchema = {
  name: 'string',
  email: 'string',
  industry: 'string?',
  website: 'string?',
  description: 'string?',
  location: 'string?',
  contactPerson: 'string?',
  phone: 'string?',
  authUserId: 'string', // Linked Firebase Auth UID
  status: 'string', // 'pending', 'approved', 'suspended'
  jobs: 'array?', // Array of job IDs
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

export default CompanySchema;