const fs = require('fs');
const xlsx = require('xlsx');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const llm = require('../../utils/llm');

jest.mock('fs');
jest.mock('xlsx');
jest.mock('@google/generative-ai');

describe('LLM Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock xlsx functions
    xlsx.readFile.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {}
      }
    });

    xlsx.utils.sheet_to_json.mockReturnValue([
      ['Header1', 'Header2'],
      ['Value1', 'Value2']
    ]);
  });

  describe('Excel File Reading', () => {
    it('should handle file reading errors', async () => {
      xlsx.readFile.mockImplementation(() => {
        throw new Error('File read error');
      });

      await expect(llm.analyzeFinancialData('test.xlsx', 0.7, 'Test prompt'))
        .rejects
        .toThrow('File read error');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query format', async () => {
      await expect(llm.queryFinancialData('test.xlsx', '', 0.7, 'Test prompt'))
        .rejects
        .toThrow();
    });

    it('should handle comparison errors', async () => {
      await expect(llm.compareFinancialData(['file1.xlsx'], 0.7, 'Test prompt'))
        .rejects
        .toThrow();
    });
  });
});
