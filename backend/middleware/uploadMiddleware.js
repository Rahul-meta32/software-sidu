const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images' || file.fieldname === 'profileImage' || file.fieldname === 'image' || file.fieldname === 'qrCode') {
    // Check image mime types
    const allowedImageTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images (jpg, jpeg, png, webp, gif) are allowed!'), false);
    }
  } else if (file.fieldname === 'video') {
    // Check video mime types
    const allowedVideoTypes = /mp4|webm|ogg|mkv|avi/;
    const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedVideoTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only videos (mp4, webm, ogg, mkv, avi) are allowed for the video field!'), false);
    }
  } else if (file.fieldname === 'apkFile' || file.fieldname === 'apk' || file.fieldname === 'adminApk' || file.fieldname.startsWith('roleApk_')) {
    // Check apk file extension
    const extname = /\.apk$/i.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Only Android Package (.apk) files are allowed!'), false);
    }
  } else if (file.fieldname === 'docFile') {
    // Check document file extensions
    const allowedDocTypes = /pdf|doc|docx|txt|rtf/;
    const extname = allowedDocTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedDocTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (extname || mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (pdf, doc, docx, txt, rtf) are allowed!'), false);
    }
  } else {
    cb(new Error('Unexpected field upload'), false);
  }
};

// Create Multer Upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB Limit size for large APK/video files
  },
});

// Define expected fields: multiple images (up to 10), one video, and APK files
const uploadDemoSiteFiles = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'apkFile', maxCount: 1 },
  { name: 'adminApk', maxCount: 1 },
  { name: 'roleApk_0', maxCount: 1 },
  { name: 'roleApk_1', maxCount: 1 },
  { name: 'roleApk_2', maxCount: 1 },
  { name: 'roleApk_3', maxCount: 1 },
  { name: 'roleApk_4', maxCount: 1 },
  { name: 'roleApk_5', maxCount: 1 },
  { name: 'roleApk_6', maxCount: 1 },
  { name: 'roleApk_7', maxCount: 1 },
  { name: 'roleApk_8', maxCount: 1 },
  { name: 'roleApk_9', maxCount: 1 },
]);

// Single profile avatar upload
const uploadAdminProfileImage = upload.single('profileImage');

// Single category image upload
const uploadCategoryImageFile = upload.single('image');

// Single document file upload (for demo requests)
const uploadDocFile = upload.single('docFile');

// Single APK file upload
const uploadSingleApkFile = upload.single('apkFile');

// Single QR code image upload
const uploadQrCodeFile = upload.single('qrCode');

module.exports = { 
  uploadDemoSiteFiles, 
  uploadAdminProfileImage, 
  uploadCategoryImageFile, 
  uploadDocFile,
  uploadSingleApkFile,
  uploadQrCodeFile
};

