import axios from 'axios';
import { getFirebaseToken, logout } from '../utils/authHelper';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'https://career-guidance-platform-1-t41w.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - use enhanced getFirebaseToken
api.interceptors.request.use(
  (config) => {
    const token = getFirebaseToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const instituteAPI = {
  register: async (dataObj) => {
    const { data } = await api.post('/institute/register', dataObj);
    return data;
  },

  login: async (credentials) => {
    const { data } = await api.post('/institute/login', credentials);
    return data;
  },

  getProfile: async (institutionId) => {
    const { data } = await api.get(`/institute/${institutionId}/profile`);
    return data;
  },

  updateProfile: async (institutionId, profileData) => {
    const { data } = await api.put(`/institute/${institutionId}/profile`, profileData);
    return data;
  },

  getFaculties: async (institutionId) => {
    const { data } = await api.get(`/institute/${institutionId}/faculties`);
    return data;
  },

  addFaculty: async (institutionId, facultyData) => {
    const { data } = await api.post(`/institute/${institutionId}/faculties`, facultyData);
    return data;
  },

  deleteFaculty: async (institutionId, facultyId) => {
    const { data } = await api.delete(`/institute/${institutionId}/faculties/${facultyId}`);
    return data;
  },

  getCourses: async (institutionId) => {
    const { data } = await api.get(`/institute/${institutionId}/courses`);
    return data;
  },

  addCourse: async (institutionId, courseData) => {
    const { data } = await api.post(`/institute/${institutionId}/courses`, courseData);
    return data;
  },

  getApplications: async (institutionId) => {
    const { data } = await api.get(`/institute/${institutionId}/applications`);
    return data;
  },

  updateApplicationStatus: async (applicationId, statusData) => {
    const { data } = await api.patch(`/institute/applications/${applicationId}`, statusData);
    return data;
  },

  getAdmissions: async (institutionId) => {
    const { data } = await api.get(`/institute/${institutionId}/admissions`);
    return data;
  },

  publishAdmissions: async (institutionId, admissionData) => {
    const { data } = await api.post(`/institute/${institutionId}/admissions`, admissionData);
    return data;
  },
};

export default instituteAPI;