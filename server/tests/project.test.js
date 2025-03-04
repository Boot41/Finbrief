const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server-core');
const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const User = require('../models/User');

let mongoServer;
const app = express();
let server;
let testUser;
let authToken;

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri);
  server = app.listen(0);

  // Create test user and get auth token
  testUser = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });

  authToken = jwt.sign(
    { userId: testUser._id },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '30d' }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  await Project.deleteMany({});
});

describe('Project Model Tests', () => {
  it('should create a new project', async () => {
    const projectData = {
      userId: testUser._id,
      filename: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1000,
      filePath: '/test/path/test.xlsx',
      status: 'uploaded'
    };

    const project = await Project.create(projectData);

    expect(project.userId.toString()).toBe(testUser._id.toString());
    expect(project.filename).toBe(projectData.filename);
    expect(project.mimeType).toBe(projectData.mimeType);
    expect(project.size).toBe(projectData.size);
    expect(project.filePath).toBe(projectData.filePath);
    expect(project.status).toBe(projectData.status);
  });

  it('should not create project without required fields', async () => {
    const projectData = {
      userId: testUser._id,
      filename: 'test.xlsx'
    };

    await expect(Project.create(projectData)).rejects.toThrow();
  });

  it('should update project analysis data', async () => {
    const projectData = {
      userId: testUser._id,
      filename: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1000,
      filePath: '/test/path/test.xlsx',
      status: 'uploaded'
    };

    const project = await Project.create(projectData);

    const analysisData = {
      summary: 'Test summary',
      insights: ['Insight 1', 'Insight 2'],
      chartData: { data: 'test' },
      status: 'analyzed'
    };

    Object.assign(project, analysisData);
    await project.save();

    const updatedProject = await Project.findById(project._id);
    expect(updatedProject.summary).toBe(analysisData.summary);
    expect(updatedProject.insights).toEqual(analysisData.insights);
    expect(updatedProject.chartData).toEqual(analysisData.chartData);
    expect(updatedProject.status).toBe(analysisData.status);
  });
});
