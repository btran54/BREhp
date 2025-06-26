const express = require('express');
const Auxiliary = require('../models/Auxiliary');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, rarity } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    
    const auxiliary = await Auxiliary.find(query).sort({ name: 1 });
    res.json(auxiliary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const auxiliary = new Auxiliary(req.body);
    await auxiliary.save();
    res.status(201).json(auxiliary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;