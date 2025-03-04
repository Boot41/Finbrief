const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server-core');
const User = require('../models/User');
const Project = require('../models/Project');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Project.deleteMany({});
});

describe('User Model', () => {
  it('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);

    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(userData.password); // Password should be hashed
  });

  it('should not create user without required fields', async () => {
    const userData = {
      username: 'testuser'
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should not create user with duplicate email', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    await User.create(userData);
    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should match password correctly', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);
    const isMatch = await user.matchPassword('password123');
    expect(isMatch).toBe(true);
  });

  it('should not match incorrect password', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);
    const isMatch = await user.matchPassword('wrongpassword');
    expect(isMatch).toBe(false);
  });
});

describe('Project Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should create a new project', async () => {
    const projectData = {
      userId: testUser._id,
      filename: 'test.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1000,
      filePath: '/test/path/test.xlsx'
    };

    const project = await Project.create(projectData);

    expect(project.userId.toString()).toBe(testUser._id.toString());
    expect(project.filename).toBe(projectData.filename);
    expect(project.mimeType).toBe(projectData.mimeType);
    expect(project.size).toBe(projectData.size);
    expect(project.filePath).toBe(projectData.filePath);
    expect(project.status).toBe('Pending'); // Default status
    expect(project.uploadedAt).toBeDefined();
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
      filePath: '/test/path/test.xlsx'
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
