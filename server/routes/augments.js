const express = require('express');
const Augment = require('../models/Augments');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rarity } = req.query;
    const query = {};
    
    if (rarity) query.rarity = rarity;
    
    const augments = await Augment.find(query).sort({ name: 1 });
    res.json(augments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const augment = new Augment(req.body);
    await augment.save();
    res.status(201).json(augment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;