import express from 'express';
import {
  generateQR,
  markAttendance,
  getStudentAttendance,
  getClassAttendance
} from '../controllers/attendanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Teacher routes
router.post('/generate-qr', authMiddleware, generateQR);
router.get('/class/:subject', authMiddleware, getClassAttendance);

// Student routes
router.post('/', authMiddleware, markAttendance);
router.get('/:regNo', authMiddleware, getStudentAttendance);

export default router;
