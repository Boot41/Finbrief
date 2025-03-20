const express = require("express");
const Project = require("../models/Project");
const ComparativeAnalysis = require("../models/Comparing"); // Updated model name
const protect = require("../middleware/authMiddleware");
const services = require("../utils/services");
const UserPreferences = require("../models/UserPreferences");

const router = express.Router();

// Helper function to validate and format analysis fields
const formatAnalysisFields = (analysis) => {
  if (!analysis) throw new Error("Analysis data is missing");

  // Ensure all required fields exist
  const requiredFields = ['KeyMetrics', 'Trends', 'Recommendations', 'PerformanceRanking'];
  for (const field of requiredFields) {
    if (!analysis[field]) {
      throw new Error(`Analysis.${field} is missing`);
    }
  }

  // Convert objects to strings if needed
  if (typeof analysis.KeyMetrics === 'object') {
    analysis.KeyMetrics = Object.entries(analysis.KeyMetrics)
      .map(([metric, values]) => {
        if (typeof values === 'object') {
          return `${metric}: ${Object.entries(values)
            .map(([company, value]) => `${company}: ${value}`)
            .join(', ')}`;
        }
        return `${metric}: ${values}`;
      })
      .join('\n');
  }

  if (typeof analysis.Trends === 'object') {
    analysis.Trends = Object.entries(analysis.Trends)
      .map(([metric, trend]) => `${metric}: ${trend}`)
      .join('\n');
  }

  if (typeof analysis.Recommendations === 'object') {
    analysis.Recommendations = Object.entries(analysis.Recommendations)
      .map(([company, rec]) => `${company}: ${rec}`)
      .join('\n');
  }

  // Validate PerformanceRanking is an array
  if (!Array.isArray(analysis.PerformanceRanking)) {
    throw new Error('PerformanceRanking must be an array');
  }

  return analysis;
};

// Helper function to validate chart data
const validateChartData = (charts) => {
  if (!charts) throw new Error("Chart data is missing");

  const requiredCharts = ['TimeSeriesComparison', 'MetricComparison', 'GrowthRateComparison'];
  for (const chartType of requiredCharts) {
    const chart = charts[chartType];
    if (!chart) continue; // Skip if chart type is not present

    if (!Array.isArray(chart.labels)) {
      throw new Error(`${chartType}.labels must be an array`);
    }

    if (!Array.isArray(chart.datasets)) {
      throw new Error(`${chartType}.datasets must be an array`);
    }

    // Validate each dataset
    chart.datasets.forEach((dataset, index) => {
      if (!dataset.label) {
        throw new Error(`${chartType}.datasets[${index}].label is missing`);
      }
      if (!Array.isArray(dataset.data)) {
        throw new Error(`${chartType}.datasets[${index}].data must be an array`);
      }
      // Ensure all data points are numbers
      dataset.data = dataset.data.map(value => {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`${chartType}.datasets[${index}].data contains non-numeric value`);
        }
        return num;
      });
    });
  }

  return charts;
};

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

    // Validate and format the response
    const formattedAnalysis = formatAnalysisFields(parsedResult.Analysis);
    const validatedCharts = validateChartData(parsedResult.ComparativeCharts);

    // Create new analysis document with validated data
    const newAnalysis = new ComparativeAnalysis({
      uploadedFiles: filePaths,
      analysisResult: {
        Analysis: formattedAnalysis,
        ComparativeCharts: validatedCharts,
      },
      createdBy: req.userId,
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
    const statusCode = error.message.includes("validation failed") ? 400 : 
                      error.message.includes("Invalid") ? 502 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message.includes("validation failed") ? "Invalid data format" :
               error.message.includes("Invalid") ? "AI analysis failed - invalid response format" :
               "Comparison processing failed",
      error: error.message,
    });
  }
});

module.exports = router;
