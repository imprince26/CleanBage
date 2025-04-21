import express from 'express';
import {
    getRoutes,
    getRoute,
    createRoute,
    updateRoute,
    deleteRoute,
    updateRouteStatus,
    collectBin,
    getCollectorActiveRoutes,
    getRouteStats
} from '../controllers/routeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getRoutes)
    .post(authorize('admin'), createRoute);

router.get('/stats', authorize('admin'), getRouteStats);
router.get('/collector/active', authorize('garbage_collector'), getCollectorActiveRoutes);

router.route('/:id')
    .get(getRoute)
    .put(authorize('admin'), updateRoute)
    .delete(authorize('admin'), deleteRoute);

router.put('/:id/status', authorize('garbage_collector'), updateRouteStatus);
router.post('/:id/collect/:binId', authorize('garbage_collector'), collectBin);

export default router;