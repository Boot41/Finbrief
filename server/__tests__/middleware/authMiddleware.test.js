const jwt = require('jsonwebtoken');
const protect = require('../../middleware/authMiddleware');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should return 403 if no token is provided', () => {
    protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if token format is invalid', () => {
    mockReq.headers.authorization = 'InvalidFormat token123';

    protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    mockReq.headers.authorization = 'Bearer invalidtoken';

    protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
