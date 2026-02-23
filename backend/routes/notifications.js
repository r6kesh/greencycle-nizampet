const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route GET /api/notifications/my
// @desc Get user's notifications
router.get('/my', protect, async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            $or: [{ user: req.user._id }, { isBroadcast: true }]
        }).sort('-createdAt').limit(50);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id, isRead: false
        });

        res.json({ success: true, unreadCount, data: notifications });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/notifications/:id/read
// @desc Mark notification as read
router.put('/:id/read', protect, async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/notifications/read-all
// @desc Mark all notifications as read
router.put('/read-all', protect, async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/notifications/send
// @desc Send promotional notification (admin)
router.post('/send', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { title, body, targetRole, userId } = req.body;

        if (userId) {
            // Send to specific user
            await Notification.create({
                user: userId, title, body, type: 'promotional'
            });
        } else if (targetRole) {
            // Send to all users with specific role
            const users = await User.find({ role: targetRole, isActive: true }).select('_id');
            const notifications = users.map(u => ({
                user: u._id, title, body, type: 'promotional'
            }));
            await Notification.insertMany(notifications);
        } else {
            // Broadcast to all
            await Notification.create({
                title, body, type: 'promotional', isBroadcast: true
            });
        }

        res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
