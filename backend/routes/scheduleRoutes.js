import express from 'express';
import {
    getSchedules,
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    completeSchedule,
    rescheduleCollection,
    getCollectorUpcomingSchedules,
    getScheduleStats
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getSchedules)
    .post(authorize('admin'), createSchedule);

router.get('/stats', authorize('admin'), getScheduleStats);
router.get('/collector/upcoming', authorize('garbage_collector'), getCollectorUpcomingSchedules);

router.route('/:id')
    .get(getSchedule)
    .put(authorize('admin'), updateSchedule)
    .delete(authorize('admin'), deleteSchedule);

router.put('/:id/complete', authorize('garbage_collector'), completeSchedule);
router.put('/:id/reschedule', rescheduleCollection);

export default router;