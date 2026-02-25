const express = require('express');
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route GET /api/announcements
// @desc Get active announcements based on role
router.get('/', protect, async (req, res, next) => {
    try {
        const query = {
            isActive: true,
            $or: [
                { target: 'all' },
                { target: req.user.role === 'agent' ? 'agents' : 'users' }
            ]
        };

        const announcements = await Announcement.find(query)
            .sort('-createdAt')
            .limit(10);

        res.json({ success: true, data: announcements });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/announcements
// @desc Create announcement (Admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { title, content, target, priority, expiresAt } = req.body;

        const announcement = await Announcement.create({
            title, content, target, priority, expiresAt,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        next(error);
    }
});

// @route DELETE /api/announcements/:id
// @desc Deactivate announcement (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Announcement deactivated' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
