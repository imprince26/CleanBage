import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cleanbage',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, crop: "scale" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${file.fieldname}-${uniqueSuffix}`;
    },
  },
});

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

const uploadImage = async (file, folder = 'cleanbage') => {
  console.log('Uploading image to Cloudinary...');
  try {
    // Handle both buffer and path-based uploads
    const uploadOptions = {
      folder: folder,
      width: 800,
      crop: "scale"
    };

    // If file is from Multer (has buffer)
    if (file.buffer) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
      return result;
    }
    // If file has path (from other upload methods)
    else if (file.path) {
      const result = await cloudinary.uploader.upload(file.path, uploadOptions);
      return result;
    }
    // If file is a temp file path string
    else if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    } else {
      throw new Error('Invalid file format for upload');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    throw error;
  }
};

export { cloudinary, upload, deleteImage, uploadImage };