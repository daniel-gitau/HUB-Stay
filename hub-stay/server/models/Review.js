const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['listing', 'food', 'car']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  }
}, { timestamps: true });

ReviewSchema.index({ targetId: 1, targetType: 1 });
ReviewSchema.index({ user: 1, targetId: 1 }, { unique: true });

ReviewSchema.statics.updateAverage = async function(targetId, targetType) {
  const stats = await this.aggregate([
    { $match: { targetId, targetType } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const Model = targetType === 'listing' ? require('./Listing') :
                targetType === 'food' ? require('./FoodPoint') : require('./Car');

  if (stats.length > 0) {
    await Model.findByIdAndUpdate(targetId, {
      rating: { average: Math.round(stats[0].average * 10) / 10, count: stats[0].count }
    });
  } else {
    await Model.findByIdAndUpdate(targetId, {
      rating: { average: 0, count: 0 }
    });
  }
};

module.exports = mongoose.model('Review', ReviewSchema);
