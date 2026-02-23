const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route GET /api/users
// @desc Get all users (admin)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 50 } = req.query;
        const query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-otp -otpExpiry -password')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            count: users.length,
            total,
            data: users
        });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/users/:id
// @desc Get single user (admin)
router.get('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-otp -otpExpiry -password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/users/:id/toggle-active
// @desc Toggle user active status (admin)
router.put('/:id/toggle-active', protect, authorize('admin'), async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
