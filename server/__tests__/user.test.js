const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

describe('User Model Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finbrief_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new user successfully', async () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(validUserData);

    expect(user.username).toBe(validUserData.username);
    expect(user.email).toBe(validUserData.email);
    // Password should be hashed
    expect(user.password).not.toBe(validUserData.password);
    expect(await bcrypt.compare(validUserData.password, user.password)).toBe(true);
  });

  it('should fail without required fields', async () => {
    const userWithoutRequired = new User({});

    try {
      await userWithoutRequired.save();
      fail('Should not save without required fields');
    } catch (error) {
      expect(error.errors.username).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    }
  });

  it('should not modify password if it hasn\'t changed', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    const originalPassword = user.password;

    user.username = 'newusername';
    await user.save();

    expect(user.password).toBe(originalPassword);
  });

  it('should correctly match password', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    const isMatch = await user.matchPassword('password123');
    const isNotMatch = await user.matchPassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should enforce unique email constraint', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    await User.create(userData);

    try {
      await User.create(userData);
      fail('Should not create user with duplicate email');
    } catch (error) {
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    }
  });
});
