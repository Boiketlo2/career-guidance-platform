import axios from 'axios';
const API = axios.create({ baseURL: process.env.REACT_APP_API_BASE });

export const createInstitution = (token, data) => API.post('/admin/institutions', data, {
  headers: { Authorization: `Bearer ${token}` }
});
export const listInstitutions = (token) => API.get('/admin/institutions', {
  headers: { Authorization: `Bearer ${token}` }
});
