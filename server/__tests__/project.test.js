const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');

describe('Project Model Tests', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finbrief_test');
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Project.deleteMany({});
  });

  it('should create a project successfully', async () => {
    const validProjectData = {
      userId: testUser._id,
      filename: 'test.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      filePath: '/path/to/file.pdf'
    };

    const project = await Project.create(validProjectData);

    expect(project.userId).toEqual(testUser._id);
    expect(project.filename).toBe(validProjectData.filename);
    expect(project.mimeType).toBe(validProjectData.mimeType);
    expect(project.size).toBe(validProjectData.size);
    expect(project.filePath).toBe(validProjectData.filePath);
    expect(project.status).toBe('Pending');
    expect(project.uploadedAt).toBeDefined();
  });

  it('should fail without required fields', async () => {
    const invalidProject = new Project({});

    try {
      await invalidProject.save();
      fail('Should not save without required fields');
    } catch (error) {
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.filename).toBeDefined();
      expect(error.errors.mimeType).toBeDefined();
      expect(error.errors.size).toBeDefined();
      expect(error.errors.filePath).toBeDefined();
    }
  });

  it('should save project with default values', async () => {
    const minimalProjectData = {
      userId: testUser._id,
      filename: 'test.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      filePath: '/path/to/file.pdf'
    };

    const project = await Project.create(minimalProjectData);

    expect(project.status).toBe('Pending');
    expect(project.summary).toBe('');
    expect(Array.isArray(project.insights)).toBe(true);
    expect(project.chartData).toBeNull();
    expect(project.futurePredictions).toBeNull();
    expect(project.uploadedAt).toBeDefined();
  });

  it('should save project with all fields', async () => {
    const fullProjectData = {
      userId: testUser._id,
      filename: 'test.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      status: 'Completed',
      summary: 'Test summary',
      insights: ['Insight 1', 'Insight 2'],
      chartData: { type: 'bar', data: [] },
      futurePredictions: { prediction: 'test' },
      filePath: '/path/to/file.pdf'
    };

    const project = await Project.create(fullProjectData);

    expect(project.userId).toEqual(testUser._id);
    expect(project.filename).toBe(fullProjectData.filename);
    expect(project.mimeType).toBe(fullProjectData.mimeType);
    expect(project.size).toBe(fullProjectData.size);
    expect(project.status).toBe(fullProjectData.status);
    expect(project.summary).toBe(fullProjectData.summary);
    expect(project.insights).toEqual(fullProjectData.insights);
    expect(project.chartData).toEqual(fullProjectData.chartData);
    expect(project.futurePredictions).toEqual(fullProjectData.futurePredictions);
    expect(project.filePath).toBe(fullProjectData.filePath);
  });
});
