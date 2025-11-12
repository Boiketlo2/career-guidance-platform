import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'https://career-guidance-platform-1-t41w.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const studentAPI = {
  // Profile Management
  getProfile: async (studentId) => {
    const { data } = await api.get(`/student/profile/${studentId}`);
    return data;
  },

  updateProfile: async (studentId, profileData) => {
    const { data } = await api.put(`/student/profile/${studentId}`, profileData);
    return data;
  },

  // Documents Management
  uploadDocument: async (documentData) => {
    const { data } = await api.post('/student/upload-document', documentData);
    return data;
  },

  getDocuments: async (studentId, type) => {
    const { data } = await api.get(`/student/documents/${studentId}${type ? `?type=${type}` : ''}`);
    return data;
  },

  // Course Applications
  getInstitutionsWithCourses: async () => {
    const { data } = await api.get('/student/institutions');
    return data;
  },

  getCoursesByInstitution: async (institutionId) => {
    const { data } = await api.get(`/student/courses/${institutionId}`);
    return data;
  },

  applyForCourse: async (applicationData) => {
    const { data } = await api.post('/student/apply-course', applicationData);
    return data;
  },

  getStudentApplications: async (studentId) => {
    const { data } = await api.get(`/student/applications/${studentId}`);
    return data;
  },

  getAdmissionResults: async (studentId) => {
    console.log(`[studentAPI] Fetching admission results for: ${studentId}`);
    const { data } = await api.get(`/student/results/${studentId}`);
    console.log(`[studentAPI] Admission results response:`, data);
    return data;
  },

  // Jobs Management
  getAllJobs: async () => {
    const { data } = await api.get('/student/jobs');
    return data;
  },

  applyForJob: async (applicationData) => {
    const { data } = await api.post('/student/apply-job', applicationData);
    return data;
  },

  // Work Experience
  addWorkExperience: async (studentId, workData) => {
    const { data } = await api.post(`/student/work-experience/${studentId}`, workData);
    return data;
  },

  // 🔹 NEW: Academic Records Management
  saveStudentSubjects: async (studentId, subjects) => {
    const { data } = await api.post(`/student/subjects/${studentId}`, { subjects });
    return data;
  },

  getStudentSubjects: async (studentId) => {
    const { data } = await api.get(`/student/subjects/${studentId}`);
    return data;
  },

  getPredefinedSubjects: async () => {
    const { data } = await api.get('/student/subjects-list/predefined');
    return data;
  },

  // 🔹 NEW: Qualified Courses
  getQualifiedCourses: async (studentId) => {
    const { data } = await api.get(`/student/qualified-courses/${studentId}`);
    return data;
  },

  // Debug endpoint
  debugStudentData: async (studentId) => {
    const { data } = await api.get(`/student/debug/${studentId}`);
    return data;
  },
};

export default studentAPI;
