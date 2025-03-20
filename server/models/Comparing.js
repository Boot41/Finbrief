const mongoose = require('mongoose');
const { Schema } = mongoose;

// Validation functions
const validateDataset = {
  validator: function(datasets) {
    return datasets.every(ds => 
      ds.label && 
      Array.isArray(ds.data) && 
      ds.data.every(d => typeof d === 'number')
    );
  },
  message: 'Dataset must have label and numeric data array'
};

const validateLabels = {
  validator: function(labels) {
    return Array.isArray(labels) && labels.length > 0;
  },
  message: 'Labels array cannot be empty'
};

// Chart dataset schema
const datasetSchema = new Schema({
  label: { type: String, required: true },
  data: { 
    type: [Number], 
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length > 0 && arr.every(n => typeof n === 'number');
      },
      message: 'Data array must contain at least one numeric value'
    }
  }
}, { _id: false });

// Chart schema
const chartSchema = new Schema({
  labels: { 
    type: [String], 
    required: true,
    validate: validateLabels
  },
  datasets: {
    type: [datasetSchema],
    required: true,
    validate: validateDataset
  }
}, { _id: false });

const comparativeAnalysisSchema = new Schema({
  // Array to store the file paths of the uploaded Excel files
  uploadedFiles: {
    type: [String],
    required: true,
    validate: {
      validator: v => v.length >= 2,
      message: 'At least two files required for comparison'
    }
  },
  // Structured analysis results matching the LLM output format
  analysisResult: {
    Analysis: {
      KeyMetrics: {
        type: String,
        required: true,
        trim: true
      },
      Trends: {
        type: String,
        required: true,
        trim: true
      },
      Recommendations: {
        type: String,
        required: true,
        trim: true
      },
      PerformanceRanking: {
        type: [String],
        required: true,
        validate: {
          validator: v => v.length >= 1,
          message: 'At least one company must be ranked'
        }
      }
    },
    ComparativeCharts: {
      TimeSeriesComparison: chartSchema,
      MetricComparison: chartSchema,
      GrowthRateComparison: chartSchema
    }
  },
  // Derived from PerformanceRanking array
  bestPerformingCompany: {
    type: String,
    required: true,
    default: function() {
      return this.analysisResult?.Analysis?.PerformanceRanking?.[0] || '';
    }
  },
  // Timestamp of analysis creation
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Optional reference to user who created the analysis
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
});

// Index for faster querying on commonly searched fields
comparativeAnalysisSchema.index({
  'bestPerformingCompany': 1,
  'createdAt': -1
});

// Pre-save middleware to ensure bestPerformingCompany is set
comparativeAnalysisSchema.pre('save', function(next) {
  if (this.analysisResult?.Analysis?.PerformanceRanking?.length > 0) {
    this.bestPerformingCompany = this.analysisResult.Analysis.PerformanceRanking[0];
  }
  next();
});

module.exports = mongoose.model('ComparativeAnalysis', comparativeAnalysisSchema);
