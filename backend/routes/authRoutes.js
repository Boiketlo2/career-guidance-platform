import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  verifyEmail
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.patch('/verify-email/:uid', verifyEmail);

// Protected routes (require authentication)
router.get('/profile/:uid', verifyToken, getUserProfile);
router.put('/profile/:uid', verifyToken, updateUserProfile);

export default router;
