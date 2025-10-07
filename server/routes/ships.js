const express = require('express');
const router = express.Router();
const Ship = require('../models/Ship');
const Auxiliary = require('../models/Auxiliary');
const Augment = require('../models/Augment');

// Helper function to calculate eHP
function calculateEHP(hp, heal, eva, lck, lvl) {
  const numerator = hp * (1 + heal);
  const denominator = 0.1 + (125 / (125 + eva + 2)) + ((50 - lck + 126 - lvl) / 1000);
  return numerator / denominator;
}

// GET all ships with calculated eHP
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, shipType, faction, rarity, search } = req.query;
    
    let query = {};
    if (shipType) query.shipType = shipType;
    if (faction) query.faction = faction;
    if (rarity) query.rarity = rarity;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const ships = await Ship.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Ship.countDocuments(query);
    
    // Load auxiliary and augment data
    const [auxiliaryData, augmentData] = await Promise.all([
      Auxiliary.find(),
      Augment.find()
    ]);
    
    // Calculate eHP for each ship with default configs
    const shipsWithEHP = ships.map(ship => {
      const shipObj = ship.toObject();
      
      // Find default equipment
      const aux1 = auxiliaryData.find(a => a.name === ship.defaultEq1) || { hp: 0, heal: 0, eva: 0, lck: 0 };
      const aux2 = auxiliaryData.find(a => a.name === ship.defaultEq2) || { hp: 0, heal: 0, eva: 0, lck: 0 };
      const aug = augmentData.find(a => a.name === ship.defaultAug) || { hp: 0, eva: 0, lck: 0 };
      
      // Calculate totals
      const totalHP = ship.hp + aux1.hp + aux2.hp + aug.hp;
      const totalHEAL = (aux1.heal || 0) + (aux2.heal || 0);
      const totalEVA = ship.eva + aux1.eva + aux2.eva + aug.eva;
      const totalLCK = ship.lck + aux1.lck + aux2.lck + aug.lck;
      
      // Calculate eHP
      const eHP = calculateEHP(totalHP, totalHEAL, totalEVA, totalLCK, ship.lvl);
      
      return {
        ...shipObj,
        eHP: Math.round(eHP)
      };
    });
    
    res.json({
      ships: shipsWithEHP,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;