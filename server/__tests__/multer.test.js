const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { handleMulterError } = require('../utils/multer');

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Mock multer
jest.mock('multer', () => {
  const multerMock = jest.fn().mockReturnValue({
    single: jest.fn()
  });
  multerMock.diskStorage = jest.fn().mockReturnValue({});
  multerMock.MulterError = class MulterError extends Error {
    constructor(code) {
      super('Multer error');
      this.code = code;
    }
  };
  return multerMock;
});

describe('Multer Utils', () => {
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
    jest.clearAllMocks();
  });

  describe('handleMulterError', () => {
    it('should call next() when there is no error', () => {
      handleMulterError(null, mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle file size limit error', () => {
      const error = new multer.MulterError('LIMIT_FILE_SIZE');
      handleMulterError(error, mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'File size too large. Maximum size is 10MB.'
      });
    });

    it('should handle general multer errors', () => {
      const error = new multer.MulterError('SOME_ERROR');
      error.message = 'Test error message';
      
      handleMulterError(error, mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Test error message'
      });
    });

    it('should handle non-multer errors', () => {
      const error = new Error('Regular error');
      handleMulterError(error, mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Regular error'
      });
    });
  });

  describe('File Upload Directory', () => {
    it('should create uploads directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      // Re-require the module to trigger the directory check
      jest.isolateModules(() => {
        require('../utils/multer');
      });

      expect(fs.existsSync).toHaveBeenCalledWith('./uploads');
      expect(fs.mkdirSync).toHaveBeenCalledWith('./uploads', { recursive: true });
    });

    it('should not create uploads directory if it exists', () => {
      fs.existsSync.mockReturnValue(true);
      
      jest.isolateModules(() => {
        require('../utils/multer');
      });

      expect(fs.existsSync).toHaveBeenCalledWith('./uploads');
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('Storage Configuration', () => {
    it('should configure multer disk storage', () => {
      jest.isolateModules(() => {
        require('../utils/multer');
      });

      const storageConfig = multer.diskStorage.mock.calls[0][0];
      
      expect(storageConfig).toHaveProperty('destination');
      expect(storageConfig).toHaveProperty('filename');
      
      // Test destination callback
      const destCb = jest.fn();
      storageConfig.destination({}, {}, destCb);
      expect(destCb).toHaveBeenCalledWith(null, './uploads');
      
      // Test filename callback
      const filenameCb = jest.fn();
      const mockFile = { originalname: 'test.xlsx' };
      storageConfig.filename({}, mockFile, filenameCb);
      expect(filenameCb).toHaveBeenCalledWith(null, expect.stringMatching(/\d+-\d+\.xlsx/));
    });
  });
});
