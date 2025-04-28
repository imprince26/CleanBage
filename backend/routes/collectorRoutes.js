import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
    getAssignedBins,
    getActiveRoutes,
    getBinDetails,
    getBinHistory,
    submitReport,
    updateBinStatus,
    getCollectorStats,
    getUpcomingCollections,
    getRouteHistory
} from '../controllers/collectorController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('garbage_collector'));

router.get('/bins', getAssignedBins);
router.get('/bins/:id', getBinDetails);
router.get('/bins/:id/history', getBinHistory);
router.post('/bins/:id/report', submitReport);
router.put('/bins/:id/status', updateBinStatus);

router.get('/routes/active', getActiveRoutes);
router.get('/routes/history', getRouteHistory);

router.get('/stats', getCollectorStats);
router.get('/collections/upcoming', getUpcomingCollections);

export default router;