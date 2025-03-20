const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modelType: { 
    type: String, 
    required: true,
    enum: ['gemini-2.0-flash', 'gemma2-9b-it'],
    default: 'gemma2-9b-it'
  },
  temperature: { 
    type: Number, 
    required: true,
    min: 0,
    max: 1,
    default: 0.3
  },
  profession: { 
    type: String, 
    required: true,
    trim: true
  },
  style: { 
    type: String, 
    required: true,
    enum: ['Normal', 'Concise', 'Explanatory', 'Formal'],
    default: 'Normal'
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Index for faster lookups
userPreferencesSchema.index({ userId: 1 });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
module.exports = UserPreferences;