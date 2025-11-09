// Firestore User Schema Reference
export const UserSchema = {
  uid: 'string', // Firebase Auth UID
  email: 'string',
  role: 'string', // 'student', 'company', 'institution', 'admin'
  name: 'string?', // For students
  institutionName: 'string?', // For institutions
  companyName: 'string?', // For companies
  emailVerified: 'boolean',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  profileCompleted: 'boolean',
  lastLogin: 'timestamp?'
};

export default UserSchema;