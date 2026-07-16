const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ targetType, targetId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ targetType, targetId })
    ]);

    res.json({
      reviews,
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

router.post('/:targetType/:targetId', auth, [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty().withMessage('Review comment is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { targetType, targetId } = req.params;
    const { rating, comment } = req.body;

    const existingReview = await Review.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }

    const review = new Review({
      user: req.user._id,
      targetType,
      targetId,
      rating,
      comment
    });

    await review.save();
    await Review.updateAverage(targetId, targetType);
    await review.populate('user', 'name avatar');

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { targetType, targetId } = review;
    await Review.findByIdAndDelete(req.params.id);
    await Review.updateAverage(targetId, targetType);

    res.json({ message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
