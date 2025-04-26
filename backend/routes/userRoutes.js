import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
    getUserStats,
    getLeaderboard
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { handleImageUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/leaderboard', getLeaderboard);

router.route('/')
    .get(authorize('admin'), getUsers)
    .post(authorize('admin'), createUser);

router.route('/:id')
    .get(authorize('admin'), getUser)
    .put(authorize('admin'), updateUser)
    .delete(authorize('admin'), deleteUser);

router.put('/:id/avatar',handleImageUpload.array('images',3), uploadAvatar);
router.get('/:id/stats', getUserStats);

export default router;