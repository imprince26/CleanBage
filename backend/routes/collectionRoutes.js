import express from 'express';
import {
    getCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    assignCollector,
    getNearbyBins,
    submitComplaint,
    getCollectionStats
} from '../controllers/collectionController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getCollections)
    .post(createCollection);

router.get('/nearby', getNearbyBins);
router.get('/stats', authorize('admin'), getCollectionStats);

router.route('/:id')
    .get(getCollection)
    .put(updateCollection)
    .delete(authorize('admin'), deleteCollection);

router.put('/:id/assign', authorize('admin'), assignCollector);
router.post('/:id/complaint', submitComplaint);

export default router;