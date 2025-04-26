import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {cloudinary} from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cleanbage',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

export const handleImageUpload = multer({ storage });