const multer = require('../../utils/multer');

describe('Multer Configuration', () => {
  describe('handleMulterError', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      nextFunction = jest.fn();
    });

    it('should handle LIMIT_FILE_SIZE error', () => {
      const error = new Error('File too large');
      error.code = 'LIMIT_FILE_SIZE';

      multer.handleMulterError(error, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'File too large'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle LIMIT_FILE_COUNT error', () => {
      const error = new Error('Too many files');
      error.code = 'LIMIT_FILE_COUNT';

      multer.handleMulterError(error, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Too many files'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle LIMIT_UNEXPECTED_FILE error', () => {
      const error = new Error('Unexpected field');
      error.code = 'LIMIT_UNEXPECTED_FILE';

      multer.handleMulterError(error, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Unexpected field'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle other multer errors', () => {
      const error = new Error('Error uploading file');
      error.code = 'OTHER_ERROR';

      multer.handleMulterError(error, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error uploading file'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
