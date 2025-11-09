import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import instituteRoutes from './instituteRoutes.js';
import studentRoutes from './studentRoutes.js';
import companyRoutes from './companyRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/institute', instituteRoutes);
router.use('/student', studentRoutes);
router.use('/company', companyRoutes);

export default router;