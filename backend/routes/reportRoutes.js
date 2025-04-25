import express from 'express';
import {
    getReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    submitFeedback,
    getReportStats
} from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { handleImageUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getReports)
    .post(authorize('garbage_collector'), handleImageUpload('images'), createReport);

router.get('/stats', authorize('admin'), getReportStats);

router.route('/:id')
    .get(getReport)
    .put(handleImageUpload('images'), updateReport)
    .delete(authorize('admin'), deleteReport);

router.post('/:id/feedback', authorize('admin'), submitFeedback);

export default router;