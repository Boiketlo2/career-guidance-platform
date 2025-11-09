// Firestore Application Schema Reference
export const ApplicationSchema = {
  studentId: 'string',
  courseId: 'string',
  institutionId: 'string',
  personalStatement: 'string?',
  status: 'string', // 'pending', 'under_review', 'admitted', 'rejected'
  appliedAt: 'timestamp',
  reviewedAt: 'timestamp?',
  reviewedBy: 'string?', // Institution admin ID
  notes: 'string?',
  documents: 'array?' // Array of document objects
};

export default ApplicationSchema;