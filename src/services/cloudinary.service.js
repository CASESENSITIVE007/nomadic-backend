import { v2 as cloudinary } from 'cloudinary';

// Configure lazily so env vars are read after dotenv.config() runs
const configure = () => {
  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  });
};

export const uploadBuffer = (buffer, options = {}) => {
  configure();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

export const deleteFile = (publicId, options = {}) => {
  configure();
  return cloudinary.uploader.destroy(publicId, options);
};

export default cloudinary;
