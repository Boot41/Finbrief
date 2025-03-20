const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const UserPreferences = require('../models/UserPreferences');
const projectRoutes = require('../routes/projectRoutes');
const mockProtect = require('./helpers/authMiddleware');
const cors = require('cors');

// Mock the protect middleware
jest.mock('../middleware/authMiddleware', () => require('./helpers/authMiddleware'));

let mongoServer;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/projects', projectRoutes);

let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri);
  process.env.JWT_SECRET = 'test-secret';
  
  // Create a test user ID and token
  userId = new mongoose.Types.ObjectId();
  token = jwt.sign({ userId }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Project.deleteMany({});
  await UserPreferences.deleteMany({});
});

describe('Project Routes', () => {
  describe('GET /api/projects/form', () => {
    it('should return empty object when no preferences exist', async () => {
      const response = await request(app)
        .get('/api/projects/form')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should return user preferences when they exist', async () => {
      const preferences = new UserPreferences({
        userId,
        modelType: 'mixtral-8x7b-32768',
        temperature: 0.7,
        profession: 'Financial Analyst',
        style: 'formal'
      });
      await preferences.save();

      const response = await request(app)
        .get('/api/projects/form')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('modelType', 'mixtral-8x7b-32768');
      expect(response.body).toHaveProperty('temperature', 0.7);
      expect(response.body).toHaveProperty('profession', 'Financial Analyst');
      expect(response.body).toHaveProperty('style', 'formal');
    });
  });

  describe('POST /api/projects/form', () => {
    const validPreferences = {
      modelType: 'mixtral-8x7b-32768',
      temperature: 0.7,
      profession: 'Financial Analyst',
      style: 'formal'
    };

    it('should create new preferences', async () => {
      const response = await request(app)
        .post('/api/projects/form')
        .set('Authorization', `Bearer ${token}`)
        .send(validPreferences);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(validPreferences);
    });

    it('should update existing preferences', async () => {
      // First create preferences
      await request(app)
        .post('/api/projects/form')
        .set('Authorization', `Bearer ${token}`)
        .send(validPreferences);

      // Then update them
      const updatedPreferences = {
        ...validPreferences,
        temperature: 0.8,
        style: 'casual'
      };

      const response = await request(app)
        .post('/api/projects/form')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPreferences);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updatedPreferences);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create some test projects with required fields
      await Project.create([
        {
          userId,
          filename: 'test1.xlsx',
          status: 'uploaded',
          filePath: '/path/to/test1.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1024
        },
        {
          userId,
          filename: 'test2.xlsx',
          status: 'analyzed',
          filePath: '/path/to/test2.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 2048
        }
      ]);
    });

    it('should return all projects for user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('filename');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should return empty array when user has no projects', async () => {
      await Project.deleteMany({}); // Clear all projects

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        userId,
        filename: 'test.xlsx',
        status: 'uploaded',
        filePath: '/path/to/test.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024
      });
      projectId = project._id;
    });

    it('should return project by id', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', projectId.toString());
      expect(response.body).toHaveProperty('filename', 'test.xlsx');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/projects/:id/status', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        userId,
        filename: 'test.xlsx',
        status: 'uploaded',
        filePath: '/path/to/test.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024
      });
      projectId = project._id;
    });

    it('should update project status', async () => {
      const response = await request(app)
        .patch(`/api/projects/${projectId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'analyzed' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'analyzed');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/projects/${fakeId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'analyzed' });

      expect(response.status).toBe(404);
    });
  });
});
