const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FoodPoint = require('../models/FoodPoint');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { city, country, cuisine, priceRange, search, featured, sort, page = 1, limit = 12 } = req.query;

    const filter = { available: true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (country) filter['location.country'] = new RegExp(country, 'i');
    if (cuisine) filter.cuisine = cuisine;
    if (priceRange) filter.priceRange = priceRange;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1 };
    else if (sort === 'name') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [foodPoints, total] = await Promise.all([
      FoodPoint.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      FoodPoint.countDocuments(filter)
    ]);

    res.json({
      foodPoints,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const foodPoint = await FoodPoint.findById(req.params.id);
    if (!foodPoint) {
      return res.status(404).json({ message: 'Food point not found' });
    }
    res.json(foodPoint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, [
  body('name').trim().notEmpty(),
  body('cuisine').isIn(['local', 'international', 'fast_food', 'fine_dining', 'cafe', 'buffet', 'street_food', 'vegetarian', 'vegan', 'seafood', 'bbq']),
  body('description').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const foodPoint = new FoodPoint(req.body);
    await foodPoint.save();
    res.status(201).json(foodPoint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const foodPoint = await FoodPoint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!foodPoint) {
      return res.status(404).json({ message: 'Food point not found' });
    }
    res.json(foodPoint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const foodPoint = await FoodPoint.findByIdAndDelete(req.params.id);
    if (!foodPoint) {
      return res.status(404).json({ message: 'Food point not found' });
    }
    res.json({ message: 'Food point removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
