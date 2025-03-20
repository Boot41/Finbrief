const express = require("express");
const Project = require("../models/Project");
const protect = require("../middleware/authMiddleware");
const { upload, handleMulterError } = require("../utils/multer");
const validatePreferences = require("../middleware/validatePrefernces");
const UserPreferences = require("../models/UserPreferences");
const { queryFinancialData, analyzeFinancialData } = require("../utils/llm");
const services = require("../utils/services");
// const { analyzeFinancialData , queryFinancialData } = require('../utils/groq');

const router = express.Router();

router.get("/form", protect, async (req, res) => {
  try {
    const preferences = await UserPreferences.findOne({ userId: req.userId });
    if (!preferences) {
      return res.status(200).json({});
    }
    res.status(200).json(preferences);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/form", protect, validatePreferences, async (req, res) => {
  try {
    const { modelType, temperature, profession, style } = req.body;

    // Look for existing preferences by userId
    let preferences = await UserPreferences.findOne({ userId: req.userId });

    if (preferences) {
      // Update existing preferences
      preferences.modelType = modelType;
      preferences.temperature = temperature;
      preferences.profession = profession;
      preferences.style = style;
      await preferences.save();
      return res.status(200).json(preferences);
    } else {
      // Create new preferences
      preferences = new UserPreferences({
        userId: req.userId, // Attach the logged-in user's ID
        modelType,
        temperature,
        profession,
        style,
      });
      const savedPreferences = await preferences.save();
      return res.status(201).json(savedPreferences);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upload a new project file
router.post(
  "/",
  protect,
  upload.single("file"),
  handleMulterError,
  async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please upload a file." });
    }

    try {
      // Create a project with just the file information
      const project = new Project({
        userId: req.userId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        filePath: file.path,
        status: "uploaded",
      });

      await project.save();

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Analyze uploaded file using Gemini and  Groq
router.post("/analyze/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get user preferences
    const preferences = await UserPreferences.findOne({ userId: req.userId });
    if (!preferences) {
      return res.status(400).json({ message: "User preferences not found" });
    }

    // Use the services layer to handle model selection
    const analysis = await services.analyzeFinancialData(
      preferences,
      project.filePath
    );

    // Check if file exists
    if (!project.filePath) {
      return res
        .status(400)
        .json({ message: "No file available for analysis" });
    }

    // Parse the JSON response correctly
    let analysisData;
    try {
      analysisData = JSON.parse(analysis);
    } catch (e) {
      // If direct parsing fails, try to extract JSON from the string
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from LLM");
      }
    }

    // Update project with analysis results
    project.summary = analysisData.Summary;
    project.insights = analysisData.KeyInsights;
    project.chartData = analysisData.ChartData;
    project.forecast = analysisData.forecast;
    project.futurePredictions = analysisData.FuturePredictions;
    project.improvementsuggestions = analysisData.improvementsuggestions;
    project.status = "analyzed";

    await project.save();
    res.json(project);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all projects for a user
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({
      uploadedAt: -1,
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific project
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project summary and insights
router.patch("/:id", protect, async (req, res) => {
  try {
    const { summary, insights } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { summary, insights },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a project
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search within a project
router.get("/search/:id", protect, async (req, res) => {
  try {
    const { query } = req.query;
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get user preferences
    const preferences = await UserPreferences.findOne({ userId: req.userId });
    if (!preferences) {
      return res.status(400).json({ message: "User preferences not found" });
    }

    // Use services layer for search
    const searchResponse = await services.queryFinancialData(
      preferences,
      project.filePath,
      query
    );

    // Parse the JSON response
    let searchData;
    try {
      searchData = JSON.parse(searchResponse);
    } catch (e) {
      const jsonMatch = searchResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        searchData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from LLM");
      }
    }

    res.json(searchData);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
