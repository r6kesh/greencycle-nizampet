const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route POST /api/payments/create-order
// @desc Create Razorpay order
router.post('/create-order', protect, async (req, res, next) => {
    try {
        const { bookingId, amount } = req.body;

        // In production, use actual Razorpay SDK:
        // const Razorpay = require('razorpay');
        // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        // const order = await instance.orders.create({ amount: amount * 100, currency: 'INR', receipt: bookingId });

        // Mock order for development
        const order = {
            id: 'order_' + Date.now(),
            amount: amount * 100,
            currency: 'INR',
            receipt: bookingId,
            status: 'created'
        };

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/payments/verify
// @desc Verify Razorpay payment
router.post('/verify', protect, async (req, res, next) => {
    try {
        const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // In production, verify signature:
        // const crypto = require('crypto');
        // const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        // shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        // const digest = shasum.digest('hex');
        // if (digest !== razorpaySignature) return res.status(400).json(...)

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.paymentStatus = 'completed';
        booking.razorpayOrderId = razorpayOrderId;
        booking.razorpayPaymentId = razorpayPaymentId;
        await booking.save();

        res.json({ success: true, message: 'Payment verified', data: booking });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/payments/history
// @desc Get payment history
router.get('/history', protect, async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id,
            paymentStatus: 'completed'
        }).select('bookingId finalAmount estimatedAmount paymentMethod paymentStatus completedAt createdAt')
            .sort('-createdAt');

        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
