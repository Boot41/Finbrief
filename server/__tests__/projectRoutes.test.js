const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const User = require('../models/User');
const projectRoutes = require('../routes/projectRoutes');

const app = express();
app.use(express.json());
// Add protect middleware to all routes
app.use((req, res, next) => {
  if (req.headers.token) {
    const decodedData = jwt.verify(req.headers.token, process.env.JWT_SECRET || 'testsecret');
    req.userId = decodedData.userId;
  }
  next();
});
app.use('/api/projects', projectRoutes);

describe('Project Routes Tests', () => {
  let testUser;
  let token;
  let testProject;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finbrief_test');
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    token = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'testsecret');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Project.deleteMany({});
    testProject = await Project.create({
      userId: testUser._id,
      filename: 'test.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      filePath: '/path/to/file.pdf',
      status: 'uploaded',
      summary: 'Test summary',
      insights: ['Test insight'],
      chartData: { type: 'bar' },
      futurePredictions: { prediction: 'test' }
    });
  });

  describe('GET /api/projects', () => {
    it('should get all projects for authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('token', token)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].filename).toBe('test.pdf');
    });

    it('should return 403 without token', async () => {
      await request(app)
        .get('/api/projects')
        .expect(403);
    });

    it('should return empty array when user has no projects', async () => {
      await Project.deleteMany({});
      const response = await request(app)
        .get('/api/projects')
        .set('token', token)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get project by id', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject._id}`)
        .set('token', token)
        .expect(200);

      expect(response.body._id).toBe(testProject._id.toString());
      expect(response.body.filename).toBe(testProject.filename);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('token', token)
        .expect(404);
    });

    it('should return 500 for invalid project id', async () => {
      await request(app)
        .get('/api/projects/invalid-id')
        .set('token', token)
        .expect(500);
    });
  });

  describe('GET /api/projects/charts/:id', () => {
    it('should get chart data for a project', async () => {
      const response = await request(app)
        .get(`/api/projects/charts/${testProject._id}`)
        .set('token', token)
        .expect(200);

      expect(response.body.summary).toBe(testProject.summary);
      expect(response.body.insights).toEqual(testProject.insights);
      expect(response.body.chartData).toEqual(testProject.chartData);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/projects/charts/${fakeId}`)
        .set('token', token)
        .expect(404);
    });

    it('should return 400 if analysis not completed', async () => {
      const incompleteProject = await Project.create({
        userId: testUser._id,
        filename: 'incomplete.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        filePath: '/path/to/file.pdf',
        status: 'uploaded'
      });

      await request(app)
        .get(`/api/projects/charts/${incompleteProject._id}`)
        .set('token', token)
        .expect(400);
    });
  });

  describe('GET /api/projects/predictions/:id', () => {
    it('should get predictions for a project', async () => {
      const response = await request(app)
        .get(`/api/projects/predictions/${testProject._id}`)
        .set('token', token)
        .expect(200);

      expect(response.body.futurePredictions).toEqual(testProject.futurePredictions);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/projects/predictions/${fakeId}`)
        .set('token', token)
        .expect(404);
    });

    it('should return 400 if predictions not available', async () => {
      const incompleteProject = await Project.create({
        userId: testUser._id,
        filename: 'incomplete.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        filePath: '/path/to/file.pdf',
        status: 'uploaded'
      });

      await request(app)
        .get(`/api/projects/predictions/${incompleteProject._id}`)
        .set('token', token)
        .expect(400);
    });
  });

  describe('PATCH /api/projects/:id/status', () => {
    it('should update project status', async () => {
      const response = await request(app)
        .patch(`/api/projects/${testProject._id}/status`)
        .set('token', token)
        .send({ status: 'analyzed' })
        .expect(200);

      expect(response.body.status).toBe('analyzed');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .patch(`/api/projects/${fakeId}/status`)
        .set('token', token)
        .send({ status: 'analyzed' })
        .expect(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project', async () => {
      await request(app)
        .delete(`/api/projects/${testProject._id}`)
        .set('token', token)
        .expect(200);

      const deletedProject = await Project.findById(testProject._id);
      expect(deletedProject).toBeNull();
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/projects/${fakeId}`)
        .set('token', token)
        .expect(404);
    });
  });
});
