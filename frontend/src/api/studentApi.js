import axios from "axios";

const BASE_URL = "http://localhost:5000/api/students"; // ✅ plural

export const registerStudent = (data) => axios.post(`${BASE_URL}/register`, data);

export const applyCourse = (data) => axios.post(`${BASE_URL}/apply`, data);

export const uploadDocument = (formData) =>
  axios.post(`${BASE_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getResults = (uid) => axios.get(`${BASE_URL}/results/${uid}`);

export const getInstitutions = () => axios.get(`${BASE_URL}/institutions-with-courses`);

export const getCourses = (institutionId) => axios.get(`${BASE_URL}/courses/${institutionId}`);

export const getJobs = () => axios.get(`${BASE_URL}/jobs`);
