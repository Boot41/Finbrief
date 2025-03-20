const geminiService = require("./llm");
const groqService = require("./groq");

const applyStyleContext = (prompt, preferences) => {
  const styleMap = {
    Normal:
      "Provide balanced analysis with moderate detail and clear explanations.",
    Concise: "Provide concise bullet points with key metrics.",
    Explanatory: "Create detailed explanations with step-by-step breakdowns.",
    Formal:
      "Use professional, academic-style analysis with precise terminology.",
  };

  return `${styleMap[preferences.style] || ""} \nContext: ${
    preferences.profession
  } analysis\n${prompt}`;
};

module.exports = {
  analyzeFinancialData: async (preferences, filePath) => {
    const basePrompt = `Analyze this financial data considering:\n- Professional context: ${preferences.profession}\n- Preferred style: ${preferences.style}`;
    const fullPrompt = applyStyleContext(basePrompt, preferences);

    if (preferences.modelType === "gemini-2.0-flash") {
      return geminiService.analyzeFinancialData(
        filePath,
        preferences.temperature,
        fullPrompt
      );
    }
    if (preferences.modelType === "mixtral-8x7b-32768") {
      return groqService.analyzeFinancialData(
        filePath,
        preferences.temperature,
        fullPrompt
      );
    }
    throw new Error("Invalid model type in preferences");
  },

  queryFinancialData: async (preferences, filePath, userQuery) => {
    const basePrompt = `Query financial data based on:\n- User question: ${userQuery}\n- Professional context: ${preferences.profession}\n- Preferred style: ${preferences.style}`;
    const fullPrompt = applyStyleContext(basePrompt, preferences);

    if (preferences.modelType === "gemini-2.0-flash") {
      return geminiService.queryFinancialData(
        filePath,
        userQuery,
        preferences.temperature,
        fullPrompt
      );
    }
    if (preferences.modelType === "mixtral-8x7b-32768") {
      return groqService.queryFinancialData(
        filePath,
        userQuery,
        preferences.temperature,
        fullPrompt
      );
    }
    throw new Error("Invalid model type in preferences");
  },

  compareFinancialData: async (preferences, filePaths) => {
    const basePrompt = `Compare the following financial datasets considering:\n- Professional context: ${preferences.profession}\n- Preferred style: ${preferences.style}`;
    const fullPrompt = applyStyleContext(basePrompt, preferences);

    if (preferences.modelType === "gemini-2.0-flash") {
      return geminiService.compareFinancialData(
        filePaths,
        preferences.temperature,
        fullPrompt
      );
    }
    if (preferences.modelType === "mixtral-8x7b-32768") {
      return groqService.compareFinancialData(
        filePaths,
        preferences.temperature,
        fullPrompt
      );
    }
    throw new Error("Invalid model type in preferences");
  },
};
