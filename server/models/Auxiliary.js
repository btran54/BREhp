const mongoose = require('mongoose');

const auxiliarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  hp: {
    type: Number,
    default: 0
  },
  heal: {
    type: Number,
    default: 0
  },
  eva: {
    type: Number,
    default: 0
  },
  lck: {
    type: Number,
    default: 0
  },
  rarity: {
    type: String,
    enum: ['T1', 'T2', 'T3', 'T4'],
    required: true
  },
  category: {
    type: String,
    enum: ['Defensive', 'Offensive', 'Support'],
    required: true
  }
}, {
  timestamps: true
});

auxiliarySchema.index({ name: 1 });
auxiliarySchema.index({ category: 1 });

module.exports = mongoose.model('Auxiliary', auxiliarySchema);