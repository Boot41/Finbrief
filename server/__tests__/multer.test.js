const { upload, handleMulterError } = require('../utils/multer');

describe('Multer Utils', () => {
  describe('handleMulterError', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn(() => mockRes),
        json: jest.fn()
      };
      nextFunction = jest.fn();
    });

    it('should call next() when there is no error', () => {
      handleMulterError(null, mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle multer errors', () => {
      const error = new Error('Some error');

      handleMulterError(error, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: error.message
      });
    });
  });

  describe('upload configuration', () => {
    it('should have correct configuration', () => {
      expect(upload).toBeDefined();
      expect(typeof upload.single).toBe('function');
    });
  });
});
