// Firestore Student Schema Reference
export const StudentSchema = {
  name: 'string',
  email: 'string',
  studentId: 'string?',
  dateOfBirth: 'string?',
  phone: 'string?',
  address: 'string?',
  highSchool: 'string?',
  graduationYear: 'string?',
  authUserId: 'string', // Linked Firebase Auth UID
  applications: 'array?', // Array of application IDs
  transcripts: 'array?', // Array of transcript objects
  certificates: 'array?', // Array of certificate objects
  workExperience: 'array?', // Array of work experience objects
  status: 'string', // 'active', 'inactive'
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

export default StudentSchema;