import { upload } from '../utils/cloudinary.js';
import ErrorResponse from '../utils/errorResponse.js';

export const handleImageUpload = (fieldName) => async (req, res, next) => {
  try {
    // Use multer upload
    upload.array(fieldName, 3);
    return next();
  } catch (error) {
    next(new ErrorResponse('Error processing image upload', 500));
    console.log(error);
  }
};