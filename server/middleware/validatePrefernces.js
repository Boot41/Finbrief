// Add validation middleware

const validatePreferences = (req, res, next) => {
    const { modelType, temperature, profession } = req.body;
    
    if (!modelType || !['groq', 'gemini'].includes(modelType)) {
      return res.status(400).json({ message: 'Invalid model type' });
    }
    
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
      return res.status(400).json({ message: 'Invalid temperature value' });
    }
    
    if (!profession || profession.trim().length < 3) {
      return res.status(400).json({ message: 'Profession is required' });
    }
    
    next();
  };

  module.exports = validatePreferences;