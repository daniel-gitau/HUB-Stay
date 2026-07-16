const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    required: true,
    enum: ['hotel', 'lodge', 'hostel']
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String,
    enum: ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'spa', 'laundry', 'ac', 'tv', 'breakfast', 'bar', 'room_service', 'airport_shuttle', 'pet_friendly']
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
  },
  rooms: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

ListingSchema.index({ 'location.city': 1, type: 1 });
ListingSchema.index({ price: 1 });
ListingSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Listing', ListingSchema);
