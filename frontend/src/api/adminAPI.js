import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminAPI = {
  // ----------------- Admin -----------------
  login: async (credentials) => {
    const { data } = await api.post('/admin/login', credentials);
    return data; // { success, message, user }
  },

  // ----------------- Institutions -----------------
  getInstitutions: async () => {
    const { data } = await api.get('/admin/institutions');
    return data; // { success, count, institutions }
  },

  addInstitution: async (institutionData) => {
    const { data } = await api.post('/admin/institutions', institutionData);
    return data; // { success, message, institution }
  },

  updateInstitution: async (id, institutionData) => {
    const { data } = await api.put(`/admin/institutions/${id}`, institutionData);
    return data; // { success, message, institution }
  },

  deleteInstitution: async (id) => {
    const { data } = await api.delete(`/admin/institutions/${id}`);
    return data; // { success, message }
  },

  // ----------------- Faculties -----------------
  getFaculties: async (institutionId) => {
    const { data } = await api.get(`/admin/institutions/${institutionId}/faculties`);
    return data; // { success, count, faculties }
  },

  addFaculty: async (institutionId, facultyData) => {
    const { data } = await api.post(`/admin/institutions/${institutionId}/faculties`, facultyData);
    return data; // { success, message, faculty }
  },

  deleteFaculty: async (facultyId) => {
    const { data } = await api.delete(`/admin/faculties/${facultyId}`);
    return data; // { success, message }
  },

  // ----------------- Courses -----------------
  addCourse: async (facultyId, courseData) => {
    // Ensure requirements array exists
    const coursePayload = { ...courseData, requirements: courseData.requirements || [] };
    const { data } = await api.post(`/admin/faculties/${facultyId}/courses`, coursePayload);
    return data; // { success, message, course }
  },

  deleteCourse: async (facultyId, courseId) => {
    const { data } = await api.delete(`/admin/faculties/${facultyId}/courses/${courseId}`);
    return data; // { success, message }
  },

  // ----------------- Companies -----------------
  getCompanies: async () => {
    const { data } = await api.get('/admin/companies');
    return data; // { success, count, companies }
  },

  approveCompany: async (companyId) => {
    const { data } = await api.patch(`/admin/companies/${companyId}/approve`);
    return data; // { success, message }
  },

  suspendCompany: async (companyId) => {
    const { data } = await api.patch(`/admin/companies/${companyId}/suspend`);
    return data; // { success, message }
  },

  deleteCompany: async (companyId) => {
    const { data } = await api.delete(`/admin/companies/${companyId}`);
    return data; // { success, message }
  },

  // ----------------- Users -----------------
  getUsers: async () => {
    const { data } = await api.get('/admin/users');
    return data; // { success, count, users }
  },

  deleteUser: async (userId) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data; // { success, message }
  },

  // ----------------- Admissions -----------------
  getAdmissions: async () => {
    const { data } = await api.get('/admin/admissions');
    return data; // { success, count, admissions }
  },

  publishAdmissions: async (admissionData) => {
    const { data } = await api.post('/admin/admissions/publish', admissionData);
    return data; // { success, message, admission }
  },

  // ----------------- Applications -----------------
  getApplications: async () => {
    const { data } = await api.get('/admin/applications');
    return data; // { success, count, applications }
  },

  // ----------------- Reports -----------------
  getReportsSummary: async () => {
    const { data } = await api.get('/admin/reports/summary');
    return data; // { success, summary, timestamp }
  },
};

export default adminAPI;
