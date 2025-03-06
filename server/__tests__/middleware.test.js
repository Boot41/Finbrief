const jwt = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Mock User model
jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

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

  it('should return 403 if no token is provided', async () => {
    await protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if token format is invalid', async () => {
    mockReq.headers.authorization = 'InvalidFormat';

    await protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if token verification fails', async () => {
    mockReq.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not found', async () => {
    jwt.verify.mockReturnValue({ id: 'nonexistentuser' });
    User.findById.mockResolvedValue(null);
    mockReq.headers.authorization = 'Bearer validtoken';

    await protect(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Incorrect Credential' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
