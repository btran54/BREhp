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
    enum: ['Common', 'Rare', 'Elite', 'Super Rare', 'Ultra Rare']
  },
  shipType: {
    type: String,
    enum: ['DD', 'CL', 'CA', 'BC', 'BB', 'CV', 'CVL', 'SS', 'AR', 'BM', 'CB']
  },
  faction: {
    type: String
  },
  armor: {
    type: String,
    enum: ['Light', 'Medium', 'Heavy', 'L', 'M', 'H']
  },
  isRetrofit: {
    type: Boolean,
    default: false
  },
  // Default equipment configuration
  defaultEq1: String,
  defaultEq2: String,
  defaultAug: String,
  // Optional fields for future use
  aa: Number,
  hpExtra: Number,
  ehpRaw: Number,
  hpBoost: Number,
  hpRaw: Number,
  uptime: [Number],
  evaBoost: [Number],
  evaRate: [Number],
  aaBoost: [Number],
  dmgRed: [Number],
  fpDmgRed: [Number],
  trpDmgRed: [Number],
  aviDmgRed: [Number]
}, {
  timestamps: true
});

shipSchema.index({ name: 1 });
shipSchema.index({ shipType: 1 });
shipSchema.index({ faction: 1 });
shipSchema.index({ rarity: 1 });

module.exports = mongoose.model('Ship', shipSchema);