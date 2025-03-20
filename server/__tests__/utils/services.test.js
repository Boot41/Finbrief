const services = require('../../utils/services');
const llm = require('../../utils/llm');
const groq = require('../../utils/groq');

jest.mock('../../utils/llm');
jest.mock('../../utils/groq');

describe('Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeFinancialData', () => {
    const mockUserPrefs = {
      modelType: 'gemma2-9b-it',
      temperature: 0.7,
      profession: 'Financial Analyst',
      style: 'Formal'
    };

    it('should handle analysis errors gracefully', async () => {
      await expect(services.analyzeFinancialData('test data', mockUserPrefs))
        .rejects
        .toBeTruthy();
    });
  });
});
