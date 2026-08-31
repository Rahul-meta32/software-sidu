const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Helper to upload a single local file to Cloudinary and delete the local file
 * @param {string} localFilePath - Path to local file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} Secure URL from Cloudinary
 */
const path = require('path');

const uploadLargePromise = (localFilePath, options) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(localFilePath, options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

const uploadToCloudinary = async (localFilePath, folder = 'demo-smartsoft') => {
  try {
    const isVideo = localFilePath.match(/\.(mp4|webm|ogg|mkv|avi)$/i);
    const isApk = localFilePath.match(/\.apk$/i);
    const isRawDoc = localFilePath.match(/\.(pdf|doc|docx|txt|rtf|xls|xlsx)$/i);
    
    // APK files strictly bypass Cloudinary to save instantly on local storage without timeouts or Cloudinary 10MB rejection errors
    if (isApk) {
      const filename = path.basename(localFilePath);
      return `uploads/${filename}`;
    }

    let result;
    if (isVideo) {

      // Use upload_large for video to handle chunked uploads and prevent timeouts/limits
      result = await uploadLargePromise(localFilePath, {
        folder: folder,
        resource_type: 'video',
        chunk_size: 6000000 // 6MB chunks
      });
    } else if (isRawDoc) {
      result = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
        resource_type: 'raw',
      });
    } else {
      result = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
        resource_type: 'image',
      });
    }
    
    // Clean up local temp file
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Failed to unlink local temp file:', err.message);
      }
    }
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failure:', error);
    
    // Write detailed log for diagnostics
    try {
      const logDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.appendFileSync(
        path.join(logDir, 'upload_error.log'),
        `[${new Date().toISOString()}] File: ${localFilePath}, Error: ${error.message}\nStack: ${error.stack}\n\n`
      );
    } catch (logErr) {
      console.error('Failed to write to log file:', logErr.message);
    }

    throw error;
  }
};


/**
 * Middleware to intercept req.file or req.files, upload them to Cloudinary,
 * and attach cloudinaryUrl to the file objects.
 */
const cloudinaryUpload = async (req, res, next) => {
  const folder = process.env.CLOUDINARY_FOLDER || 'demo-smartsoft';

  // Handle single file (req.file)
  if (req.file && !req.file.path.match(/\.apk$/i)) {
    try {
      const url = await uploadToCloudinary(req.file.path, folder);
      req.file.cloudinaryUrl = url;
    } catch (err) {
      console.warn(`[Cloudinary Warning] Upload failed for req.file (${req.file.filename}). Falling back to local storage:`, err.message);
    }
  }

  // Handle multiple fields / files (req.files)
  if (req.files) {
    // Handle images array field
    if (req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        try {
          const url = await uploadToCloudinary(file.path, folder);
          file.cloudinaryUrl = url;
        } catch (err) {
          console.warn(`[Cloudinary Warning] Upload failed for images array file (${file.filename}). Falling back to local storage:`, err.message);
        }
      }
    }
    
    // Handle video array field
    if (req.files.video && req.files.video.length > 0) {
      for (const file of req.files.video) {
        try {
          const url = await uploadToCloudinary(file.path, folder);
          file.cloudinaryUrl = url;
        } catch (err) {
          console.warn(`[Cloudinary Warning] Upload failed for video file (${file.filename}). Falling back to local storage:`, err.message);
        }
      }
    }

    // Handle profileImage single field inside fields (if used as field)
    if (req.files.profileImage && req.files.profileImage.length > 0) {
      for (const file of req.files.profileImage) {
        try {
          const url = await uploadToCloudinary(file.path, folder);
          file.cloudinaryUrl = url;
        } catch (err) {
          console.warn(`[Cloudinary Warning] Upload failed for profileImage field (${file.filename}). Falling back to local storage:`, err.message);
        }
      }
    }
    
    // Handle image field inside fields
    if (req.files.image && req.files.image.length > 0) {
      for (const file of req.files.image) {
        try {
          const url = await uploadToCloudinary(file.path, folder);
          file.cloudinaryUrl = url;
        } catch (err) {
          console.warn(`[Cloudinary Warning] Upload failed for image field (${file.filename}). Falling back to local storage:`, err.message);
        }
      }
    }
  }

  next();
};

module.exports = { cloudinaryUpload, uploadToCloudinary };


