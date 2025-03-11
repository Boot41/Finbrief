const express = require('express');
const Project = require('../models/Project');
const protect = require('../middleware/authMiddleware'); 
const { upload, handleMulterError, upload_mul } = require('../utils/multer');
const { analyzeFinancialData, queryFinancialData } = require('../utils/llm');

const router = express.Router();

// Upload a new project file
router.post('/', protect, upload.single('file'), handleMulterError, async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Please upload a file.' });
  }

  try {
    // Create a project with just the file information
    const project = new Project({
      userId: req.userId,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path,
      status: 'uploaded'
    });

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analyze uploaded file using LLM
router.post('/analyze/:id', protect, async (req, res) => {
  console.log(req.params.id)
  try {
    // Find the project
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if file exists
    if (!project.filePath) {
      return res.status(400).json({ message: 'No file available for analysis' });
    }

    // Analyze the uploaded file using LLM
    const analysis = await analyzeFinancialData(project.filePath);
    console.log('Raw LLM Response:', analysis);
    
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
        throw new Error('Invalid JSON response from LLM');
      }
    }

    console.log('Parsed Analysis Data:', analysisData);

    // Update project with analysis results
    project.summary = analysisData.Summary;
    project.insights = analysisData.KeyInsights;
    project.chartData = analysisData.ChartData;
    project.futurePredictions = analysisData.FuturePredictions;
    project.status = 'analyzed';

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Analysis error:', error);
    // project.status = 'analysis failed';
    // await project.save();
    res.status(500).json({ message: error.message });
  }
});

// Get all projects for a user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({ uploadedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project summary and insights
router.patch('/:id', protect, async (req, res) => {
  try {
    const { summary, insights } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { summary, insights },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chart data for a specific project
router.get('/charts/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.summary || !project.insights || !project.chartData) {
      return res.status(400).json({ message: 'Analysis not completed or chart data not available' });
    }

    res.json({
      summary: project.summary,
      insights: project.insights,
      chartData: project.chartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get predictions for a specific project
router.get('/predictions/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.futurePredictions) {
      return res.status(400).json({ message: 'Predictions not available yet' });
    }

    res.json({
      futurePredictions: project.futurePredictions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search within a project
router.get('/search/:id', protect, async (req, res) => {
  try {
    const { query } = req.query;
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.filePath) {
      return res.status(400).json({ message: 'No file available for search' });
    }

    // Query the financial data using LLM
    const searchResponse = await queryFinancialData(project.filePath, query);
    
    // Parse the JSON response
    let searchData;
    try {
      searchData = JSON.parse(searchResponse);
    } catch (e) {
      const jsonMatch = searchResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        searchData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from LLM');
      }
    }

    res.json(searchData);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;