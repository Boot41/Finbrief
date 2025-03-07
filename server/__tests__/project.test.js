const request = require('supertest');
const express = require('express');
const projectRoutes = require('../routes/projectRoutes');
const Project = require('../models/Project');

// Mock protect middleware
jest.mock('../middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  };
});

// Mock Project model
jest.mock('../models/Project', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

describe('Project Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should get all projects for a user', async () => {
      const mockProjects = [
        { _id: '123', userId: 'test-user-id', filename: 'test1.pdf' },
        { _id: '456', userId: 'test-user-id', filename: 'test2.pdf' }
      ];

      Project.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProjects)
      });

      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjects);
    });
  });

  describe('GET /:id', () => {
    it('should get a specific project', async () => {
      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf'
      };

      Project.findOne.mockResolvedValue(mockProject);

      const response = await request(app)
        .get('/api/projects/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProject);
    });

    it('should return 404 for non-existent project', async () => {
      Project.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/projects/123');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Project not found');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a project', async () => {
      Project.findOneAndDelete.mockResolvedValue({
        _id: '123',
        userId: 'test-user-id'
      });

      const response = await request(app)
        .delete('/api/projects/123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Project deleted successfully');
    });

    it('should return 404 if project not found', async () => {
      Project.findOneAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/projects/123');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Project not found');
    });
  });
});
