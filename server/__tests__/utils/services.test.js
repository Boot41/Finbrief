const services = require('../../utils/services');
const llm = require('../../utils/llm');
const groq = require('../../utils/groq');

jest.mock('../../utils/llm');
jest.mock('../../utils/groq');

describe('Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserPrefs = {
    modelType: 'gemma2-9b-it',
    temperature: 0.7,
    profession: 'Financial Analyst',
    style: 'Formal'
  };

  const mockGeminiPrefs = {
    ...mockUserPrefs,
    modelType: 'gemini-2.0-flash'
  };

  describe('analyzeFinancialData', () => {
    it('should call groq service for gemma2-9b-it model', async () => {
      const filePath = 'test.pdf';
      groq.analyzeFinancialData.mockResolvedValue('Analysis result');
      
      const result = await services.analyzeFinancialData(mockUserPrefs, filePath);
      
      expect(groq.analyzeFinancialData).toHaveBeenCalled();
      expect(result).toBe('Analysis result');
    });

    it('should call gemini service for gemini-2.0-flash model', async () => {
      const filePath = 'test.pdf';
      llm.analyzeFinancialData.mockResolvedValue('Analysis result');
      
      const result = await services.analyzeFinancialData(mockGeminiPrefs, filePath);
      
      expect(llm.analyzeFinancialData).toHaveBeenCalled();
      expect(result).toBe('Analysis result');
    });

    it('should throw error for invalid model type', async () => {
      const filePath = 'test.pdf';
      await expect(services.analyzeFinancialData({ ...mockUserPrefs, modelType: 'invalid' }, filePath))
        .rejects
        .toThrow('Invalid model type in preferences');
    });
  });

  describe('queryFinancialData', () => {
    const userQuery = 'What is the revenue?';
    const filePath = 'test.pdf';

    it('should call groq service for gemma2-9b-it model', async () => {
      groq.queryFinancialData.mockResolvedValue('Query result');
      
      const result = await services.queryFinancialData(mockUserPrefs, filePath, userQuery);
      
      expect(groq.queryFinancialData).toHaveBeenCalled();
      expect(result).toBe('Query result');
    });

    it('should call gemini service for gemini-2.0-flash model', async () => {
      llm.queryFinancialData.mockResolvedValue('Query result');
      
      const result = await services.queryFinancialData(mockGeminiPrefs, filePath, userQuery);
      
      expect(llm.queryFinancialData).toHaveBeenCalled();
      expect(result).toBe('Query result');
    });

    it('should throw error for invalid model type', async () => {
      await expect(services.queryFinancialData({ ...mockUserPrefs, modelType: 'invalid' }, filePath, userQuery))
        .rejects
        .toThrow('Invalid model type in preferences');
    });
  });

  describe('compareFinancialData', () => {
    const filePaths = ['test1.pdf', 'test2.pdf'];

    it('should call groq service for gemma2-9b-it model', async () => {
      groq.compareFinancialData.mockResolvedValue('Comparison result');
      
      const result = await services.compareFinancialData(mockUserPrefs, filePaths);
      
      expect(groq.compareFinancialData).toHaveBeenCalled();
      expect(result).toBe('Comparison result');
    });

    it('should call gemini service for gemini-2.0-flash model', async () => {
      llm.compareFinancialData.mockResolvedValue('Comparison result');
      
      const result = await services.compareFinancialData(mockGeminiPrefs, filePaths);
      
      expect(llm.compareFinancialData).toHaveBeenCalled();
      expect(result).toBe('Comparison result');
    });

    it('should throw error for invalid model type', async () => {
      await expect(services.compareFinancialData({ ...mockUserPrefs, modelType: 'invalid' }, filePaths))
        .rejects
        .toThrow('Invalid model type in preferences');
    });
  });
});
