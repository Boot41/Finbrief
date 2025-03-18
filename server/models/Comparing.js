const mongoose = require('mongoose');
const { Schema } = mongoose;

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
        required: true
      },
      Trends: {
        type: String,
        required: true
      },
      Recommendations: {
        type: String,
        required: true
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
      TimeSeriesComparison: {
        labels: [String],
        datasets: [{
          label: String,
          data: [Number]
        }]
      },
      MetricComparison: {
        labels: [String],
        datasets: [{
          label: String,
          data: [Number]
        }]
      },
      GrowthRateComparison: {
        labels: [String],
        datasets: [{
          label: String,
          data: [Number]
        }]
      }
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
    default: Date.now
  },
  // Optional reference to user who created the analysis
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Index for faster querying on commonly searched fields
comparativeAnalysisSchema.index({
  'bestPerformingCompany': 1,
  'createdAt': -1
});

module.exports = mongoose.model('ComparativeAnalysis', comparativeAnalysisSchema);
