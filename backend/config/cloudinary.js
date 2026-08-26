const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dskozf0bz',
  api_key: process.env.CLOUDINARY_API_KEY || '855715425143891',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ZsH5e7-NDSe5bIt_g5DfCqI3B-I',
});

module.exports = cloudinary;
