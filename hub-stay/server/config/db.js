const mongoose = require('mongoose');
const config = require('./keys');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn('Server will run without database. API endpoints will return errors.');
  }
};

module.exports = connectDB;
