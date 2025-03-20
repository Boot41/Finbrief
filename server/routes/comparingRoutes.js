const express = require("express");
const Project = require("../models/Project");
const ComparativeAnalysis = require("../models/Comparing"); // Updated model name
const protect = require("../middleware/authMiddleware");
const { compareFinancialData } = require("../utils/llm");
// const {compareFinancialData} = require("../utils/groq")
const services = require("../utils/services");
const UserPreferences = require("../models/UserPreferences");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    // Validate input
    if (!req.query.projectIds) {
      return res
        .status(400)
        .json({ message: "projectIds query parameter is required" });
    }

    const projectIds = req.query.projectIds.split(",");
    if (projectIds.length < 2) {
      return res
        .status(400)
        .json({ message: "At least two projects required for comparison" });
    }

    // Find projects with access control
    const projects = await Project.find({
      _id: { $in: projectIds },
      userId: req.userId,
    }).select("filePath");

    if (projects.length !== projectIds.length) {
      return res
        .status(404)
        .json({ message: "One or more projects not found" });
    }

    // Get user preferences
    const preferences = await UserPreferences.findOne({ userId: req.userId });
    if (!preferences) {
      return res.status(400).json({ message: "User preferences not found" });
    }

    const filePaths = projects.map((project) => project.filePath);

    // Use services layer for comparison
    const result = await services.compareFinancialData(preferences, filePaths);
    const parsedResult = JSON.parse(result);

    // Validate LLM response structure
    if (!parsedResult?.Analysis || !parsedResult?.ComparativeCharts) {
      throw new Error("Invalid analysis format from LLM");
    }

    // Create new analysis document with updated schema
    const newAnalysis = new ComparativeAnalysis({
      uploadedFiles: filePaths,
      analysisResult: {
        Analysis: parsedResult.Analysis,
        ComparativeCharts: parsedResult.ComparativeCharts,
      },
      // bestPerformingCompany is auto-populated from schema default
      createdBy: req.userId, // Add user reference from auth middleware
    });

    await newAnalysis.save();

    res.status(201).json({
      success: true,
      data: {
        analysis: newAnalysis.analysisResult.Analysis,
        charts: newAnalysis.analysisResult.ComparativeCharts,
        bestPerformingCompany: newAnalysis.bestPerformingCompany,
        id: newAnalysis._id,
      },
    });
  } catch (error) {
    console.error("Comparison error:", error);
    const statusCode = error.message.includes("Invalid analysis") ? 502 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message.startsWith("Invalid")
        ? "AI analysis failed - invalid response format"
        : "Comparison processing failed",
      error: error.message,
    });
  }
});

module.exports = router;
