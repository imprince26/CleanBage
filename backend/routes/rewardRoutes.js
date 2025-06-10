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
    getRewardStats,
    getRewardRedemptions,
    redeemReward
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
    .post(authorize('admin'), handleImageUpload.single('image'), createRewardItem);

router.route('/items/:id')
    .get(getRewardItem)
    .put(
        authorize('admin'),
       handleImageUpload.single('image'),
        updateRewardItem
    )
    .delete(authorize('admin'), deleteRewardItem);

router.post('/items/:id/redeem', redeemRewardItem);
router.get(
    '/items/:id/redemptions',
    authorize('admin'),
    getRewardRedemptions
);
export default router;