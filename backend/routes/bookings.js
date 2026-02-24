const express = require('express');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route POST /api/bookings
// @desc Create new booking
router.post('/', protect, async (req, res, next) => {
    try {
        const { items, address, scheduledDate, timeSlot, notes, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one item is required' });
        }

        // Calculate estimated amount
        let estimatedAmount = 0;
        const populatedItems = [];

        for (const item of items) {
            const category = await Category.findById(item.category);
            if (!category) continue;

            const amount = category.pricePerKg * item.estimatedWeight;
            estimatedAmount += amount;

            populatedItems.push({
                category: category._id,
                categoryName: category.name,
                estimatedWeight: item.estimatedWeight,
                pricePerKg: category.pricePerKg,
                amount
            });
        }

        const booking = await Booking.create({
            user: req.user._id,
            items: populatedItems,
            address,
            scheduledDate,
            timeSlot,
            notes,
            paymentMethod: paymentMethod || 'cash',
            estimatedAmount,
            status: 'pending'
        });

        // Create notification
        await Notification.create({
            user: req.user._id,
            title: 'Booking Confirmed! 🎉',
            body: `Your booking #${booking.bookingId} has been placed. Estimated amount: ₹${estimatedAmount}`,
            type: 'booking_confirmed',
            data: { bookingId: booking._id }
        });

        // Update user stats
        await User.findByIdAndUpdate(req.user._id, { $inc: { totalPickups: 1 } });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/bookings/my
// @desc Get current user's bookings
router.get('/my', protect, async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = { user: req.user._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('agent', 'name phone')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            count: bookings.length,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            data: bookings
        });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/bookings/all
// @desc Get all bookings (admin)
router.get('/all', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { status, page = 1, limit = 50, date, search } = req.query;
        const query = {};

        if (status && status !== 'all') query.status = status;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.scheduledDate = { $gte: start, $lte: end };
        }
        if (search) {
            // Find users matching search for name/phone
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map(u => u._id);

            query.$or = [
                { bookingId: { $regex: search, $options: 'i' } },
                { 'address.fullAddress': { $regex: search, $options: 'i' } },
                { user: { $in: userIds } }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('user', 'name phone')
            .populate('agent', 'name phone')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            count: bookings.length,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            data: bookings
        });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/bookings/:id
// @desc Get single booking
router.get('/:id', protect, async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name phone')
            .populate('agent', 'name phone agentRating');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Ensure user can only see their own bookings (unless admin/agent)
        if (req.user.role === 'customer' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/bookings/:id/status
// @desc Update booking status (admin)
router.put('/:id/status', protect, authorize('admin', 'agent'), async (req, res, next) => {
    try {
        const { status, cancelReason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.status = status;
        if (cancelReason) booking.cancelReason = cancelReason;
        await booking.save();

        // Send notification based on status
        const notifMessages = {
            confirmed: { title: 'Booking Confirmed ✅', body: `Your booking #${booking.bookingId} has been confirmed!` },
            assigned: { title: 'Agent Assigned 🚛', body: `An agent has been assigned for your pickup #${booking.bookingId}` },
            out_for_pickup: { title: 'On The Way! 🏃', body: `Our agent is heading to your location for pickup #${booking.bookingId}` },
            completed: { title: 'Pickup Completed! 🎉', body: `Pickup #${booking.bookingId} is done. Amount: ₹${booking.finalAmount || booking.estimatedAmount}` },
            cancelled: { title: 'Booking Cancelled ❌', body: `Booking #${booking.bookingId} has been cancelled.` }
        };

        if (notifMessages[status]) {
            await Notification.create({
                user: booking.user,
                ...notifMessages[status],
                type: status === 'completed' ? 'pickup_completed' : 'booking_confirmed',
                data: { bookingId: booking._id }
            });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/bookings/:id/assign
// @desc Assign agent to booking (admin)
router.put('/:id/assign', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { agentId } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.agent = agentId;
        booking.status = 'assigned';
        await booking.save();

        // Notify agent
        await Notification.create({
            user: agentId,
            title: 'New Pickup Assigned 📦',
            body: `You have a new pickup #${booking.bookingId} scheduled for ${new Date(booking.scheduledDate).toLocaleDateString()}`,
            type: 'booking_assigned',
            data: { bookingId: booking._id }
        });

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/bookings/:id/cancel
// @desc Cancel booking (customer)
router.put('/:id/cancel', protect, async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
        }

        booking.status = 'cancelled';
        booking.cancelReason = req.body.reason || 'Cancelled by user';
        await booking.save();

        res.json({ success: true, message: 'Booking cancelled', data: booking });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/bookings/:id/rate
// @desc Rate a completed booking
router.put('/:id/rate', protect, async (req, res, next) => {
    try {
        const { rating, feedback } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking || booking.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Cannot rate this booking' });
        }

        booking.rating = rating;
        booking.feedback = feedback;
        await booking.save();

        // Update agent rating
        if (booking.agent) {
            const agentBookings = await Booking.find({ agent: booking.agent, rating: { $exists: true } });
            const avgRating = agentBookings.reduce((sum, b) => sum + b.rating, 0) / agentBookings.length;
            await User.findByIdAndUpdate(booking.agent, { agentRating: avgRating.toFixed(1) });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
