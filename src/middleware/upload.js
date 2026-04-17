import multer from 'multer';

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPG, PNG, WEBP) are allowed.'), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default { upload };
