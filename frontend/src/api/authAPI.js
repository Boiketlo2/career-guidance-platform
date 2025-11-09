import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// 🔒 Attach token automatically
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // 🧾 Register: backend handles Firebase Auth creation now
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);

    // Save user in localStorage (no token yet; token will be acquired on login)
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  },

  // 🔑 Login: uses Firebase Auth to get token, then backend to fetch profile
  login: async ({ email, password }) => {
    // Use Firebase Auth to sign in and get ID token
    const { auth } = await import('../utils/firebase'); // dynamic import to avoid errors
    const { signInWithEmailAndPassword } = await import('firebase/auth');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const token = await user.getIdToken();
    const response = await api.post('/auth/login', { token });

    if (response.data.success) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // 👤 Profile
  getProfile: async (uid) => (await api.get(`/auth/profile/${uid}`)).data,
  updateProfile: async (uid, profileData) => (await api.put(`/auth/profile/${uid}`, profileData)).data,
  verifyEmail: async (uid) => (await api.patch(`/auth/verify-email/${uid}`)).data,

  // 🚪 Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

export default authAPI;
