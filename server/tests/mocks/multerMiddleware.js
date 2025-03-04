const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../test-files/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const mockUpload = multer({ storage: storage });

module.exports = {
  upload: mockUpload,
  handleMulterError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};
