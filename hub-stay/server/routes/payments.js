const express = require('express');
const router = express.Router();
const stripe = require('stripe')(require('../config/keys').stripeSecret);
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');

router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('listingId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!require('../config/keys').stripeSecret || require('../config/keys').stripeSecret === 'sk_test_your_stripe_key_here') {
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      await booking.save();
      return res.json({ message: 'Payment simulated (Stripe not configured)', booking });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Hub Stay - ${booking.listingType} booking`,
            description: `Booking at ${booking.listingId?.name || 'Hub Stay'}`
          },
          unit_amount: Math.round(booking.totalPrice * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/client/pages/profile.html?payment=success`,
      cancel_url: `${req.headers.origin}/client/pages/profile.html?payment=cancelled`,
      metadata: { bookingId: booking._id.toString() }
    });

    booking.paymentIntentId = session.payment_intent;
    await booking.save();

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Payment processing error' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_your_webhook_secret';

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await Booking.findByIdAndUpdate(session.metadata.bookingId, {
        status: 'confirmed',
        paymentStatus: 'paid'
      });
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }
});

module.exports = router;
