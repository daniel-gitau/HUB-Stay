const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Car = require('../models/Car');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { city, country, type, transmission, fuelType, minPrice, maxPrice, minSeats, search, sort, page = 1, limit = 12 } = req.query;

    const filter = { available: true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (country) filter['location.country'] = new RegExp(country, 'i');
    if (type) filter.type = type;
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (minSeats) filter.seats = { $gte: Number(minSeats) };
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { pricePerDay: 1 };
    else if (sort === 'price_desc') sortOption = { pricePerDay: -1 };
    else if (sort === 'rating') sortOption = { 'rating.average': -1 };
    else if (sort === 'year') sortOption = { year: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [cars, total] = await Promise.all([
      Car.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      Car.countDocuments(filter)
    ]);

    res.json({
      cars,
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
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, [
  body('make').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').isInt({ min: 2000 }),
  body('pricePerDay').isNumeric({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ message: 'Car removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
