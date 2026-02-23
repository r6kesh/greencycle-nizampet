const express = require('express');
const bcrypt = require('bcryptjs');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// @route GET /api/agents
// @desc Get all agents (admin)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const agents = await User.find({ role: 'agent' })
            .select('name phone agentArea agentRating agentIsAvailable isActive totalPickups')
            .sort('-createdAt');

        res.json({ success: true, data: agents });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/agents
// @desc Create new agent (admin)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { name, phone, password, agentArea, agentVehicle } = req.body;

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            existingUser.role = 'agent';
            existingUser.name = name || existingUser.name;
            existingUser.agentArea = agentArea;
            existingUser.agentVehicle = agentVehicle;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                existingUser.password = await bcrypt.hash(password, salt);
            }
            await existingUser.save();
            return res.json({ success: true, data: existingUser });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'agent123', salt);

        const agent = await User.create({
            name, phone, password: hashedPassword,
            role: 'agent', agentArea, agentVehicle,
            isVerified: true
        });

        res.status(201).json({ success: true, data: agent });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/agents/pickups
// @desc Get assigned pickups for agent
router.get('/pickups', protect, authorize('agent'), async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = { agent: req.user._id };

        if (status) {
            query.status = status;
        } else {
            query.status = { $in: ['assigned', 'out_for_pickup'] };
        }

        const bookings = await Booking.find(query)
            .populate('user', 'name phone')
            .sort('scheduledDate');

        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/agents/pickups/:id/start
// @desc Mark pickup as out for pickup
router.put('/pickups/:id/start', protect, authorize('agent'), async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, agent: req.user._id });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        booking.status = 'out_for_pickup';
        await booking.save();

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/agents/pickups/:id/complete
// @desc Complete a pickup
router.put('/pickups/:id/complete', protect, authorize('agent'), async (req, res, next) => {
    try {
        const { items, finalAmount } = req.body;
        const booking = await Booking.findOne({ _id: req.params.id, agent: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Update actual weights
        if (items && items.length > 0) {
            booking.items = items.map((item, i) => ({
                ...booking.items[i]?.toObject(),
                actualWeight: item.actualWeight,
                amount: item.actualWeight * (booking.items[i]?.pricePerKg || 0)
            }));
        }

        booking.finalAmount = finalAmount || booking.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        booking.status = 'completed';
        booking.completedAt = new Date();

        if (booking.paymentMethod === 'cash') {
            booking.paymentStatus = 'completed';
        }

        await booking.save();

        // Update user earnings
        await User.findByIdAndUpdate(booking.user, {
            $inc: { totalEarnings: booking.finalAmount, loyaltyPoints: Math.floor(booking.finalAmount / 10) }
        });

        res.json({ success: true, message: 'Pickup completed', data: booking });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/agents/pickups/:id/photo
// @desc Upload photo proof
router.post('/pickups/:id/photo', protect, authorize('agent'), upload.single('photo'), async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, agent: req.user._id });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (req.file) {
            booking.photos.push(`/uploads/${req.file.filename}`);
            await booking.save();
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
