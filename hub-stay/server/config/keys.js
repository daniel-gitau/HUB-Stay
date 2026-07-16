require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hubstay',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_me',
  stripeSecret: process.env.STRIPE_SECRET_KEY || '',
  stripePublishable: process.env.STRIPE_PUBLISHABLE_KEY || ''
};
