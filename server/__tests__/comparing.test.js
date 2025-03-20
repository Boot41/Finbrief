const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const UserPreferences = require('../models/UserPreferences');
const ComparativeAnalysis = require('../models/Comparing');
const comparingRoutes = require('../routes/comparingRoutes');
const services = require('../utils/services');
const mockProtect = require('./helpers/authMiddleware');
const cors = require('cors');

// Mock the protect middleware
jest.mock('../middleware/authMiddleware', () => require('./helpers/authMiddleware'));

// Mock the services module
jest.mock('../utils/services');

let mongoServer;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/comparing', comparingRoutes);

let token;
let userId;
let projectId1;
let projectId2;

const mockValidAnalysisResponse = {
  Analysis: {
    KeyMetrics: {
      'Revenue Growth': { 'Company A': '10%', 'Company B': '15%' },
      'Profit Margin': { 'Company A': '20%', 'Company B': '25%' }
    },
    Trends: {
      'Market Share': 'Increasing',
      'Cost Structure': 'Stable'
    },
    Recommendations: {
      'Company A': 'Improve efficiency',
      'Company B': 'Expand market'
    },
    PerformanceRanking: ['Company B', 'Company A']
  },
  ComparativeCharts: {
    TimeSeriesComparison: {
      labels: ['2020', '2021', '2022'],
      datasets: [
        {
          label: 'Company A',
          data: [100, 120, 140]
        },
        {
          label: 'Company B',
          data: [110, 130, 150]
        }
      ]
    },
    MetricComparison: {
      labels: ['Revenue', 'Profit', 'Assets'],
      datasets: [
        {
          label: 'Company A',
          data: [200, 50, 300]
        },
        {
          label: 'Company B',
          data: [220, 55, 320]
        }
      ]
    },
    GrowthRateComparison: {
      labels: ['Revenue Growth', 'Profit Growth'],
      datasets: [
        {
          label: 'Company A',
          data: [10, 15]
        },
        {
          label: 'Company B',
          data: [12, 18]
        }
      ]
    }
  }
};

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
  await ComparativeAnalysis.deleteMany({});

  // Create test projects
  const project1 = await Project.create({
    userId,
    filename: 'company1.xlsx',
    status: 'uploaded',
    filePath: '/path/to/company1.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024
  });
  projectId1 = project1._id;

  const project2 = await Project.create({
    userId,
    filename: 'company2.xlsx',
    status: 'uploaded',
    filePath: '/path/to/company2.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024
  });
  projectId2 = project2._id;

  // Create test user preferences
  await UserPreferences.create({
    userId,
    modelType: 'gemma2-9b-it',
    temperature: 0.7,
    profession: 'Financial Analyst',
    style: 'Formal'
  });

  // Reset all mocks
  jest.clearAllMocks();
});

describe('Comparing Routes', () => {
  describe('GET /api/comparing', () => {
    it('should return 400 if projectIds query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/comparing')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('projectIds query parameter is required');
    });

    it('should return 400 if less than two projects are provided', async () => {
      const response = await request(app)
        .get(`/api/comparing?projectIds=${projectId1}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('At least two projects required for comparison');
    });

    it('should return 404 if one or more projects are not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/comparing?projectIds=${projectId1},${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('One or more projects not found');
    });

    it('should return 400 if user preferences are not found', async () => {
      await UserPreferences.deleteMany({}); // Remove user preferences

      const response = await request(app)
        .get(`/api/comparing?projectIds=${projectId1},${projectId2}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User preferences not found');
    });

    it('should successfully compare two projects', async () => {
      services.compareFinancialData.mockResolvedValue(JSON.stringify(mockValidAnalysisResponse));

      const response = await request(app)
        .get(`/api/comparing?projectIds=${projectId1},${projectId2}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data).toHaveProperty('charts');
      expect(response.body.data).toHaveProperty('bestPerformingCompany');
      expect(response.body.data).toHaveProperty('id');

      // Verify the analysis was saved to the database
      const savedAnalysis = await ComparativeAnalysis.findById(response.body.data.id);
      expect(savedAnalysis).toBeTruthy();
      expect(savedAnalysis.uploadedFiles).toHaveLength(2);
      expect(savedAnalysis.createdBy.toString()).toBe(userId.toString());
    });

    it('should handle AI service failure', async () => {
      services.compareFinancialData.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .get(`/api/comparing?projectIds=${projectId1},${projectId2}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Comparison processing failed');
    });

    it('should format analysis fields correctly', async () => {
      services.compareFinancialData.mockResolvedValue(JSON.stringify(mockValidAnalysisResponse));

      const response = await request(app)
        .get(`/api/comparing?projectIds=${projectId1},${projectId2}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      
      const { analysis } = response.body.data;
      expect(typeof analysis.KeyMetrics).toBe('string');
      expect(typeof analysis.Trends).toBe('string');
      expect(typeof analysis.Recommendations).toBe('string');
      expect(Array.isArray(analysis.PerformanceRanking)).toBe(true);

      // Verify the content is properly formatted
      expect(analysis.KeyMetrics).toContain('Revenue Growth');
      expect(analysis.Trends).toContain('Market Share');
      expect(analysis.Recommendations).toContain('Company A');
      expect(analysis.PerformanceRanking).toContain('Company B');
    });

    it('should validate and format chart data correctly', async () => {
      services.compareFinancialData.mockResolvedValue(JSON.stringify(mockValidAnalysisResponse));

      const response = await request(app)
        .get(`/api/comparing?projectIds=${projectId1},${projectId2}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      
      const { charts } = response.body.data;
      expect(charts).toHaveProperty('TimeSeriesComparison');
      expect(charts).toHaveProperty('MetricComparison');
      expect(charts).toHaveProperty('GrowthRateComparison');

      // Verify chart structure
      const { TimeSeriesComparison } = charts;
      expect(TimeSeriesComparison.labels).toBeInstanceOf(Array);
      expect(TimeSeriesComparison.datasets).toBeInstanceOf(Array);
      expect(TimeSeriesComparison.datasets[0]).toHaveProperty('label');
      expect(TimeSeriesComparison.datasets[0]).toHaveProperty('data');
      expect(TimeSeriesComparison.datasets[0].data).toBeInstanceOf(Array);
      expect(typeof TimeSeriesComparison.datasets[0].data[0]).toBe('number');

      // Verify data validation
      const { datasets } = TimeSeriesComparison;
      datasets.forEach(dataset => {
        expect(dataset.data.every(value => typeof value === 'number')).toBe(true);
      });
    });
  });
});
