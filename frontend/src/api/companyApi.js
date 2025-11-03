import axios from "axios";

const API_BASE = "http://localhost:5000/api/companies";

// ✅ Register a new company
export const registerCompany = async (companyData) => {
  try {
    const response = await axios.post(`${API_BASE}/register`, companyData);
    return response.data;
  } catch (error) {
    console.error("Error registering company:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Post a new job (fixed URL)
export const postJob = async (jobData) => {
  try {
    const response = await axios.post(`${API_BASE}/post-job`, jobData);
    return response.data;
  } catch (error) {
    console.error("Error posting job:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get all jobs for a specific company
export const getJobsByCompany = async (companyId) => {
  try {
    const response = await axios.get(`${API_BASE}/jobs/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching company jobs:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get applicants for a company
export const getApplicants = async (companyId) => {
  try {
    const response = await axios.get(`${API_BASE}/applicants/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching applicants:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Send feedback
export const sendFeedback = async (feedbackData) => {
  try {
    const response = await axios.post(`${API_BASE}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    console.error("Error sending feedback:", error.response?.data || error.message);
    throw error;
  }
};
