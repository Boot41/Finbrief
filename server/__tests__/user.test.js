const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  genSalt: jest.fn(),
  compare: jest.fn()
}));

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Schema', () => {
    it('should have required fields', () => {
      const user = new User();
      const validationError = user.validateSync();
      
      expect(validationError.errors.username).toBeDefined();
      expect(validationError.errors.email).toBeDefined();
      expect(validationError.errors.password).toBeDefined();
    });

    it('should validate all fields', () => {
      const validUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      
      const validationError = validUser.validateSync();
      expect(validationError).toBeUndefined();
    });
  });

  describe('matchPassword Method', () => {
    it('should return true for matching password', async () => {
      bcrypt.compare.mockResolvedValue(true);
      
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });

      const isMatch = await user.matchPassword('password123');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });

      const isMatch = await user.matchPassword('wrongpassword');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(isMatch).toBe(false);
    });
  });
});
