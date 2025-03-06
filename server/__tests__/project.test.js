const request = require('supertest');
const express = require('express');
const projectRoutes = require('../routes/projectRoutes');
const { analyzeFinancialData } = require('../utils/llm');

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  model: jest.fn()
}));

// Mock Project model
jest.mock('../models/Project', () => {
  return {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    findById: jest.fn(),
    deleteMany: jest.fn()
  };
});

// Mock protect middleware
jest.mock('../middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.userId = 'test-user-id';
    next();
  };
});

// Mock LLM functions
jest.mock('../utils/llm', () => ({
  analyzeFinancialData: jest.fn(),
  queryFinancialData: jest.fn()
}));

// Mock multer
jest.mock('../utils/multer', () => ({
  upload: {
    single: () => (req, res, next) => {
      req.file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/test/path/test.pdf'
      };
      next();
    }
  },
  handleMulterError: (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

const Project = require('../models/Project');

describe('Project Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should get all projects for a user', async () => {
      const mockProjects = [
        { _id: '123', userId: 'test-user-id', filename: 'test1.pdf', status: 'uploaded' },
        { _id: '456', userId: 'test-user-id', filename: 'test2.pdf', status: 'analyzed' }
      ];
      Project.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProjects)
      });

      const response = await request(app).get('/api/projects');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjects);
    });

    it('should handle database errors', async () => {
      Project.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app).get('/api/projects');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /:id', () => {
    it('should get a specific project', async () => {
      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        status: 'uploaded'
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
    });
  });

  describe('POST /analyze/:id', () => {
    it('should analyze a project successfully', async () => {
      const mockAnalysis = JSON.stringify({
        Summary: 'Test summary',
        KeyInsights: ['Insight 1', 'Insight 2'],
        ChartData: { data: [] },
        FuturePredictions: ['Prediction 1']
      });
      analyzeFinancialData.mockResolvedValue(mockAnalysis);

      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        filePath: '/test/path.pdf',
        status: 'uploaded',
        save: jest.fn().mockResolvedValue(true)
      };
      Project.findOne.mockResolvedValue(mockProject);

      const response = await request(app)
        .post('/api/projects/analyze/123');

      expect(response.status).toBe(200);
      expect(mockProject.save).toHaveBeenCalled();
    });

    it('should handle invalid JSON response from LLM', async () => {
      analyzeFinancialData.mockResolvedValue('Invalid JSON');

      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        filePath: '/test/path.pdf',
        status: 'uploaded',
        save: jest.fn()
      };
      Project.findOne.mockResolvedValue(mockProject);

      const response = await request(app)
        .post('/api/projects/analyze/123');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /charts/:id', () => {
    it('should get chart data for a project', async () => {
      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        status: 'analyzed',
        summary: 'Test summary',
        insights: ['Test insight'],
        chartData: { data: [1, 2, 3] }
      };
      Project.findOne.mockResolvedValue(mockProject);

      const response = await request(app)
        .get('/api/projects/charts/123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('chartData');
      expect(response.body.chartData).toEqual({ data: [1, 2, 3] });
    });

    it('should handle missing chart data', async () => {
      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        status: 'uploaded'
      };
      Project.findOne.mockResolvedValue(mockProject);

      const response = await request(app)
        .get('/api/projects/charts/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Analysis not completed or chart data not available');
    });
  });

  describe('PATCH /:id', () => {
    it('should update project summary and insights', async () => {
      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        summary: 'Updated summary',
        insights: ['Updated insight']
      };
      Project.findOneAndUpdate.mockResolvedValue(mockProject);

      const response = await request(app)
        .patch('/api/projects/123')
        .send({
          summary: 'Updated summary',
          insights: ['Updated insight']
        });

      expect(response.status).toBe(200);
      expect(response.body.summary).toBe('Updated summary');
      expect(response.body.insights).toEqual(['Updated insight']);
    });
  });

  describe('GET /predictions/:id', () => {
    it('should get predictions for a project', async () => {
      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        status: 'analyzed',
        futurePredictions: ['Prediction 1', 'Prediction 2']
      };
      Project.findOne.mockResolvedValue(mockProject);

      const response = await request(app)
        .get('/api/projects/predictions/123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('futurePredictions');
      expect(response.body.futurePredictions).toEqual(['Prediction 1', 'Prediction 2']);
    });

    it('should handle missing predictions', async () => {
      const mockProject = {
        _id: '123',
        userId: 'test-user-id',
        filename: 'test.pdf',
        status: 'uploaded'
      };
      Project.findOne.mockResolvedValue(mockProject);

      const response = await request(app)
        .get('/api/projects/predictions/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Predictions not available yet');
    });
  });
});
