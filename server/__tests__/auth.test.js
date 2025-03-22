const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const mockProtect = require('./helpers/authMiddleware');
const cors = require('cors');

// Mock the protect middleware
jest.mock('../middleware/authMiddleware', () => require('./helpers/authMiddleware'));

// Mock the google-auth-library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn()
  }))
}));

let mongoServer;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri);
  process.env.JWT_SECRET = 'test-secret';
  process.env.GOOGLE_CLIENT_ID = 'mock-client-id';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  // Reset all mocks before each test
  jest.clearAllMocks();
});

describe('Auth Routes', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not allow duplicate email registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app).post('/api/auth/signup').send(userData);
      const response = await request(app).post('/api/auth/signup').send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const userData = {
        name: 'Test User',
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
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('trimmedemail', 'test');
    });

    it('should not login with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create a test user
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // Get the user ID from the response
      userId = response.body.user.id;

      // Login to get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      token = loginResponse.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/google/callback', () => {
    const mockGooglePayload = {
      email: 'google@example.com',
      name: 'Google User',
      sub: '12345'
    };

    beforeEach(() => {
      // Mock the verifyIdToken implementation for each test
      const { OAuth2Client } = require('google-auth-library');
      OAuth2Client.prototype.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => mockGooglePayload
      });
    });

    it('should create a new user when Google user first time login', async () => {
      const response = await request(app)
        .post('/api/auth/google/callback')
        .send({ token: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', mockGooglePayload.email);
      expect(response.body.user).toHaveProperty('name', mockGooglePayload.name);
      expect(response.body.user).toHaveProperty('googleAuth', true);
      expect(response.body).toHaveProperty('trimmedemail', 'google');

      // Verify user was created in database
      const user = await User.findOne({ email: mockGooglePayload.email });
      expect(user).toBeTruthy();
      expect(user.googleAuth).toBe(true);
    });

    it('should login existing Google user', async () => {
      // First create a Google user
      await request(app)
        .post('/api/auth/google/callback')
        .send({ token: 'valid-google-token' });

      // Try logging in with the same Google account
      const response = await request(app)
        .post('/api/auth/google/callback')
        .send({ token: 'valid-google-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', mockGooglePayload.email);
      expect(response.body).toHaveProperty('trimmedemail', 'google');

      // Verify no duplicate user was created
      const users = await User.find({ email: mockGooglePayload.email });
      expect(users).toHaveLength(1);
    });

    it('should handle invalid Google token', async () => {
      const { OAuth2Client } = require('google-auth-library');
      OAuth2Client.prototype.verifyIdToken = jest.fn().mockRejectedValue(
        new Error('Invalid token')
      );

      const response = await request(app)
        .post('/api/auth/google/callback')
        .send({ token: 'invalid-google-token' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid Google token');
    });

    it('should handle missing token', async () => {
      const response = await request(app)
        .post('/api/auth/google/callback')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid Google token');
    });
  });
});
