import { upload } from '../utils/cloudinary.js';
import ErrorResponse from '../utils/errorResponse.js';

export const handleImageUpload = (fieldName) => async (req, res, next) => {
  try {
    // Use multer upload
    upload.array(fieldName, 3)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse('File size should be less than 5MB', 400));
        }
        return next(new ErrorResponse(err.message, 400));
      }
      next();
    });
  } catch (error) {
    next(new ErrorResponse('Error processing image upload', 500));
  }
};