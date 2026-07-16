const mongoose = require('mongoose');

const FoodPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  cuisine: {
    type: String,
    required: true,
    enum: ['local', 'international', 'fast_food', 'fine_dining', 'cafe', 'buffet', 'street_food', 'vegetarian', 'vegan', 'seafood', 'bbq']
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  priceRange: {
    type: String,
    required: true,
    enum: ['$', '$$', '$$$', '$$$$']
  },
  hours: {
    open: { type: String, default: '08:00' },
    close: { type: String, default: '22:00' }
  },
  images: [{
    type: String
  }],
  menu: [{
    name: { type: String },
    price: { type: Number },
    description: { type: String }
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  featured: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

FoodPointSchema.index({ 'location.city': 1, cuisine: 1 });
FoodPointSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('FoodPoint', FoodPointSchema);
