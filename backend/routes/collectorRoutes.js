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
  getRecentCollections,
  getUpcomingSchedules,
  getUrgentBins,
  getCollectorPerformance,
    getUpcomingCollections,
    getRouteHistory,
    getCollectorActivity,
    getCollectorRoutes,
    updateRouteStatus,
    getBinCollectionHistory
} from '../controllers/collectorController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('garbage_collector'));

router.get('/bins', getAssignedBins);
router.get('/bins/:id', getBinDetails);
router.get('/bins-history', getBinCollectionHistory);
router.get('/bins/:id/history', getBinHistory);
router.post('/bins/:id/report', submitReport);
router.put('/bins/:id/status', updateBinStatus);

router.get('/routes/active', getActiveRoutes);
router.get('/routes/history', getRouteHistory);

router.get('/stats', getCollectorStats);
router.get('/collections/recent', getRecentCollections);
router.get('/schedules/upcoming', getUpcomingSchedules);
router.get('/bins/urgent', getUrgentBins);
router.get('/performance', getCollectorPerformance);
// router.get('/achievements', getAchievements);
router.get('/collections/upcoming', getUpcomingCollections);
router.get('/activity', getCollectorActivity);
router.get('/routes', getCollectorRoutes);
router.put('/routes/:id/status', updateRouteStatus);
export default router;