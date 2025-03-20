// Add validation middleware

const validatePreferences = (req, res, next) => {
  const { modelType, temperature, profession } = req.body;

  if (
    !modelType ||
    !["mixtral-8x7b-32768", "gemini-2.0-flash"].includes(modelType)
  ) {
    return res.status(400).json({ message: "Invalid model type" });
  }

  if (typeof temperature !== "number" || temperature < 0 || temperature > 1) {
    return res.status(400).json({ message: "Invalid temperature value" });
  }

  if (!profession || profession.trim().length < 3) {
    return res.status(400).json({ message: "Profession is required" });
  }

  next();
};

module.exports = validatePreferences;
