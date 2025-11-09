// Firestore Job Schema Reference
export const JobSchema = {
  title: 'string',
  description: 'string',
  companyId: 'string',
  requirements: 'array', // Array of requirement objects
  qualifications: 'array', // Array of qualification objects
  location: 'string',
  salaryRange: 'object?', // { min: number, max: number, currency: string }
  jobType: 'string', // 'full-time', 'part-time', 'internship'
  applicationDeadline: 'timestamp?',
  status: 'string', // 'active', 'closed', 'draft'
  applicants: 'array?', // Array of applicant IDs
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

export default JobSchema;
