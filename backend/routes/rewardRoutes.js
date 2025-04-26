import express from 'express';
import {
    getUserTransactions,
    getRewardItems,
    getRewardItem,
    createRewardItem,
    updateRewardItem,
    deleteRewardItem,
    redeemRewardItem,
    getUserRedemptions,
    getRewardStats
} from '../controllers/rewardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { handleImageUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/transactions', getUserTransactions);
router.get('/redemptions', getUserRedemptions);
router.get('/stats', authorize('admin'), getRewardStats);

router.route('/items')
    .get(getRewardItems)
    .post(authorize('admin'),handleImageUpload.array('images',3), createRewardItem);

router.route('/items/:id')
    .get(getRewardItem)
    .put(authorize('admin'),handleImageUpload.array('images',3), updateRewardItem)
    .delete(authorize('admin'), deleteRewardItem);

router.post('/items/:id/redeem', redeemRewardItem);

export default router;