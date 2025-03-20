const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modelType: { type: String, required: true },
  temperature: { type: Number, required: true },
  profession: { type: String, required: true },
  style: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
module.exports = UserPreferences;