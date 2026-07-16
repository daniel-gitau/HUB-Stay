const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['sedan', 'suv', 'hatchback', 'van', 'truck', 'luxury', 'convertible']
  },
  seats: {
    type: Number,
    required: true,
    min: 2,
    max: 15
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'petrol'
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  images: [{
    type: String
  }],
  features: [{
    type: String,
    enum: ['gps', 'bluetooth', 'ac', 'heating', 'child_seat', 'backup_camera', 'cruise_control', 'sunroof', 'leather_seats']
  }],
  available: {
    type: Boolean,
    default: true
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  licensePlate: {
    type: String,
    trim: true
  }
}, { timestamps: true });

CarSchema.index({ 'location.city': 1, type: 1 });
CarSchema.index({ pricePerDay: 1 });
CarSchema.index({ make: 'text', model: 'text' });

module.exports = mongoose.model('Car', CarSchema);
