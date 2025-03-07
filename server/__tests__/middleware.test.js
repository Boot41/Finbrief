const jwt = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn(() => mockRes),
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

  it('should call next() with valid token', () => {
    const userId = '123';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'testsecret');
    mockReq.headers.token = token;

    protect(mockReq, mockRes, nextFunction);
    
    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.userId).toBe(userId);
  });

  it('should return 403 if token is invalid', () => {
    mockReq.headers.token = 'invalid-token';
    
    protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
