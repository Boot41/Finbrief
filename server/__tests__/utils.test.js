const multer = require('multer');
const { handleMulterError } = require('../utils/multer');

describe('Multer Error Handler Tests', () => {
  let mockReq, mockRes, nextFn;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFn = jest.fn();
  });

  it('should handle file size error', () => {
    const err = new multer.MulterError('LIMIT_FILE_SIZE');
    handleMulterError(err, mockReq, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'File size too large. Maximum size is 10MB.'
    });
  });

  it('should handle general multer error', () => {
    const err = new multer.MulterError('SOME_ERROR', 'Test error');
    handleMulterError(err, mockReq, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: err.message
    });
  });

  it('should handle non-multer error', () => {
    const err = new Error('Custom error');
    handleMulterError(err, mockReq, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: err.message
    });
  });

  it('should call next if no error', () => {
    handleMulterError(null, mockReq, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalled();
  });
});
