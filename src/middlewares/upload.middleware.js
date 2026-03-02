const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Utilisez JPEG, PNG ou WebP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Middleware for uploading a single image field named 'image'.
 * Attaches req.file if present (optional upload).
 */
exports.uploadSingle = upload.single('image');

/**
 * Get the relative URL path for a multer file object.
 * @param {Express.Multer.File} file
 * @returns {string}
 */
exports.getImageUrl = (file) => `/uploads/${file.filename}`;

/**
 * Delete an uploaded file by its stored relative URL path.
 * Silently ignores missing files.
 * @param {string} imagePath  e.g. '/uploads/123456-filename.jpg'
 */
exports.deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const absPath = path.join(uploadsDir, path.basename(imagePath));
  fs.unlink(absPath, () => {});
};
