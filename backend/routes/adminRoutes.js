import express from 'express';
import {
    getDashboardStats,
    getPerformanceMetrics,
    getCollectionAnalytics,
    getSystemHealth,
    getBins, 
    createBin,
    updateBin,
    deleteBin,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard and Analytics Routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/performance/metrics', getPerformanceMetrics);
router.get('/analytics/collections', getCollectionAnalytics);
router.get('/system/health', getSystemHealth);

router.route('/bins')
    .get(getBins)
    .post(createBin);

router.route('/bins/:id')
    .put(updateBin)
    .delete(deleteBin);

export default router;