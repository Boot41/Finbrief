const { analyzeFinancialData, queryFinancialData } = require('../utils/llm');
const xlsx = require('xlsx');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock xlsx
jest.mock('xlsx', () => ({
  readFile: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}));

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    Summary: "Test summary",
                    KeyInsights: ["Insight 1", "Insight 2"],
                    ChartData: {
                      ExpensesByCategory: {
                        labels: ["Jan"],
                        datasets: [{ label: "Expenses", data: [100] }]
                      }
                    },
                    FuturePredictions: ["Prediction 1"]
                  })
                }]
              }
            }]
          }
        })
      })
    }))
  };
});

describe('LLM Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Excel file reading
    xlsx.readFile.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {}
      }
    });
    xlsx.utils.sheet_to_json.mockReturnValue([
      ['Date', 'Amount', 'Category'],
      ['2024-01-01', 100, 'Food']
    ]);
  });

  describe('analyzeFinancialData', () => {
    it('should analyze financial data from Excel file', async () => {
      const result = await analyzeFinancialData('test.xlsx');
      const parsedResult = JSON.parse(result);
      
      expect(parsedResult).toHaveProperty('Summary');
      expect(parsedResult).toHaveProperty('KeyInsights');
      expect(parsedResult).toHaveProperty('ChartData');
      expect(xlsx.readFile).toHaveBeenCalledWith('test.xlsx');
    });
  });

  describe('queryFinancialData', () => {
    it('should handle user queries on financial data', async () => {
      const result = await queryFinancialData('test.xlsx', 'What are the total expenses?');
      const parsedResult = JSON.parse(result);
      
      expect(parsedResult).toHaveProperty('Summary');
      expect(parsedResult).toHaveProperty('KeyInsights');
      expect(xlsx.readFile).toHaveBeenCalledWith('test.xlsx');
    });
  });
});
