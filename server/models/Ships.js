const mongoose = require('mongoose');

const shipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  hp: {
    type: Number,
    required: true
  },
  eva: {
    type: Number,
    required: true
  },
  lck: {
    type: Number,
    required: true
  },
  lvl: {
    type: Number,
    required: true,
    default: 125
  },
  rarity: {
    type: String,
    enum: ['Common', 'Rare', 'Elite', 'Super Rare', 'Ultra Rare'],
    required: true
  },
  shipType: {
    type: String,
    enum: ['DD', 'CL', 'CA', 'BC', 'BB', 'CV', 'CVL', 'SS', 'AR', 'BM'],
    required: true
  },
  faction: {
    type: String,
    required: true
  },
  isRetrofit: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

shipSchema.index({ name: 1 });
shipSchema.index({ shipType: 1 });
shipSchema.index({ faction: 1 });
shipSchema.index({ rarity: 1 });

module.exports = mongoose.model('Ship', shipSchema);