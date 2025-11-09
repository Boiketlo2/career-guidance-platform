import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

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

export const companyAPI = {
  register: async (companyData) => {
    const { data } = await api.post('/company/register', companyData);
    return data; // { success, message, company }
  },

  postJob: async (jobData) => {
    const { data } = await api.post('/company/jobs', jobData);
    return data; // { success, message, job }
  },

  getJobs: async (companyId) => {
    const { data } = await api.get(`/company/jobs/${companyId}`);
    return data; // { success, count, jobs }
  },

  getJobApplicants: async (jobId) => {
    const { data } = await api.get(`/company/jobs/${jobId}/applicants`);
    return data; // { success, count, applicants }
  },

  updateApplicantStatus: async (jobId, applicantId, statusData) => {
    const { data } = await api.patch(`/company/jobs/${jobId}/applicants/${applicantId}`, statusData);
    return data; // { success, message, applicant }
  },

  getProfile: async (companyId) => {
    const { data } = await api.get(`/company/profile/${companyId}`);
    return data; // { success, company }
  },

  updateProfile: async (companyId, profileData) => {
    const { data } = await api.put(`/company/profile/${companyId}`, profileData);
    return data; // { success, message, company }
  },
};

export default companyAPI;
