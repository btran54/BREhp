const mongoose = require('mongoose');

const augmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  hp: {
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
    enum: ['T1', 'T2', 'T3'],
    required: true
  }
}, {
  timestamps: true
});

augmentSchema.index({ name: 1 });

module.exports = mongoose.model('Augment', augmentSchema);