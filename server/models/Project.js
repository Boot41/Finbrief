const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  status: {   // Added missing status field
    type: String,
    default: 'Pending'
  },
  summary: {
    type: String,
    default: ''
  },
  insights: {
    type: [String],
    default: ''
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed, // Mixed type to store flexible JSON data
    default: null,
  },
  forecast: {
    type : String,
    default: ''
  },
  improvementsuggestions: {
    type: [String],
    default: ''
  },
  futurePredictions: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  filePath: {
    type: String,
    required: true
  },
 
});

module.exports = mongoose.model('Project', ProjectSchema);
