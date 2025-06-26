const express = require('express');
const Ship = require('../models/Ships');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { 
      shipType, 
      faction, 
      rarity, 
      page = 1, 
      limit = 100,
      search 
    } = req.query;
    
    const query = {};
    
    if (shipType) query.shipType = shipType;
    if (faction) query.faction = faction;
    if (rarity) query.rarity = rarity;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const ships = await Ship.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });
    
    const total = await Ship.countDocuments(query);
    
    res.json({
      ships,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ship = await Ship.findById(req.params.id);
    if (!ship) {
      return res.status(404).json({ error: 'Ship not found' });
    }
    res.json(ship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const ship = new Ship(req.body);
    await ship.save();
    res.status(201).json(ship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;