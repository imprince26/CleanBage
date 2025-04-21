import express from 'express';
import {
    getUserNotifications,
    getNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    getNotificationCount
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUserNotifications);
router.get('/count', getNotificationCount);
router.put('/read-all', markAllAsRead);
router.delete('/delete-read', deleteReadNotifications);

router.route('/:id')
    .get(getNotification)
    .delete(deleteNotification);

router.put('/:id/read', markAsRead);

export default router;