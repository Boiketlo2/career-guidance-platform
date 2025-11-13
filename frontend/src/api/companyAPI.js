import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'https://career-guidance-platform-1-t41w.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically for protected routes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 API Request Interceptor - Token:', token ? 'Exists' : 'MISSING');
    console.log('🔐 API Request URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Authorization header set');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    return Promise.reject(error);
  }
);

export const companyAPI = {
  register: async (companyData) => {
    const { data } = await api.post('/company/register', companyData);
    return data;
  },

  postJob: async (jobData) => {
    console.log('📤 Posting job data:', jobData);
    const { data } = await api.post('/company/jobs', jobData);
    return data;
  },

  getJobs: async (companyId) => {
    const { data } = await api.get(`/company/jobs/company/${companyId}`);
    return data;
  },

  getJobApplicants: async (jobId) => {
    const { data } = await api.get(`/company/jobs/${jobId}/applicants`);
    return data;
  },

  updateApplicantStatus: async (jobId, applicantId, statusData) => {
    const { data } = await api.patch(`/company/jobs/${jobId}/applicants/${applicantId}`, statusData);
    return data;
  },

  getProfile: async (companyId) => {
    const { data } = await api.get(`/company/profile/${companyId}`);
    return data;
  },

  updateProfile: async (companyId, profileData) => {
    const { data } = await api.put(`/company/profile/${companyId}`, profileData);
    return data;
  },

  getAllCompanies: async () => {
    const { data } = await api.get('/company/');
    return data;
  },

  getCompanyJobPosts: async (companyId) => {
    const { data } = await api.get(`/company/${companyId}/job-posts`);
    return data;
  },

  // Test endpoint to check if company exists
  checkCompanyExists: async (companyId) => {
    const { data } = await api.get(`/company/profile/${companyId}`);
    return data;
  }
};

export default companyAPI;
