const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const protect = require('../middleware/authMiddleware');

// Create an express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finbrief_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the users collection before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.username).toBe(userData.username);
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create(userData);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.msg).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      await request(app).post('/api/auth/signup').send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');

      // Verify the token is valid
      const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET || 'testsecret');
      expect(decodedToken).toHaveProperty('userId');
    });

    it('should not login with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create a test user and get token
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const user = await User.create(userData);
      userId = user._id;
      token = jwt.sign({ userId }, process.env.JWT_SECRET || 'testsecret');
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('token', token)
        .expect(200);

      expect(response.body.user).toHaveProperty('_id', userId.toString());
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(403);

      expect(response.body.message).toBe('Incorrect Credential');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('token', 'invalid-token')
        .expect(403);

      expect(response.body.message).toBe('Incorrect Credential');
    });
  });
});
