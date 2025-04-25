import express from 'express';
import {
    getAllFeedback,
    getUserFeedback,
    getFeedback,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    respondToFeedback,
    getFeedbackStats
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { handleImageUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(authorize('admin'), getAllFeedback)
    .post(handleImageUpload('images'),createFeedback);

router.get('/me', getUserFeedback);
router.get('/stats', authorize('admin'), getFeedbackStats);

router.route('/:id')
    .get(getFeedback)
    .put(updateFeedback)
    .delete(deleteFeedback);

router.post('/:id/respond', authorize('admin'), respondToFeedback);

export default router;