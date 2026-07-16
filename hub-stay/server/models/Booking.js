const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingType: {
    type: String,
    required: true,
    enum: ['listing', 'food', 'car']
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'listingModel'
  },
  listingModel: {
    type: String,
    required: true,
    enum: ['Listing', 'FoodPoint', 'Car']
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date
  },
  guests: {
    type: Number,
    default: 1,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentIntentId: {
    type: String
  },
  specialRequests: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ listingId: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
