const multer = require('multer');
const { uploadSingleFile, uploadMultipleFiles } = require('../../utils/multer');

jest.mock('multer');

describe('Multer Configuration', () => {
  describe('Error Handling', () => {
    it('should handle file size limit exceeded', () => {
      const error = new Error('File too large');
      error.code = 'LIMIT_FILE_SIZE';
      
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      uploadSingleFile(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'File size limit exceeded'
      });
    });

    it('should handle unsupported file type', () => {
      const error = new Error('Invalid file type');
      error.code = 'INVALID_FILE_TYPE';
      
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      uploadMultipleFiles(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid file type'
      });
    });
  });
});
