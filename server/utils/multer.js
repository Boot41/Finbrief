const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Define the upload directory path
const uploadDir = './uploads';

// Ensure the 'uploads' directory exists; if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Use the defined uploadDir
  },
  filename: (req, file, cb) => {
    // Generate a unique filename while preserving the original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check both mimetype and file extension
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const allowedExts = ['.xlsx', '.xls'];
  
  const mime = allowedMimes.includes(file.mimetype);
  const ext = allowedExts.includes(path.extname(file.originalname).toLowerCase());

  if (mime && ext) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files (.xls, .xlsx) are allowed.'), false);
  }
};

// Initialize multer with file size limits and storage settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,  // Max file size: 10MB
    files: 1  // Allow only 1 file per request
  },
  fileFilter: fileFilter
});

// Initialize multer for multiple file upload
const upload_mul = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit (optional)
}).array("files", 10); // 'files' is the field name, max 10 files


// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, handleMulterError, upload_mul };
