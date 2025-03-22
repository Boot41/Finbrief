const fs = require('fs');
const xlsx = require('xlsx');
const { Groq } = require('groq-sdk');
const groq = require('../../utils/groq');

jest.mock('fs');
jest.mock('xlsx');
jest.mock('groq-sdk');

describe('Groq Service', () => {
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

      await expect(groq.analyzeFinancialData('test.xlsx', 0.7, 'Test prompt'))
        .rejects
        .toThrow('File read error');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query format', async () => {
      await expect(groq.queryFinancialData('test.xlsx', '', 0.7, 'Test prompt'))
        .rejects
        .toThrow('Failed to generate content');
    });

    it('should handle comparison errors', async () => {
      await expect(groq.compareFinancialData(['file1.xlsx'], 0.7, 'Test prompt'))
        .rejects
        .toThrow('Failed to generate content');
    });
  });
});
