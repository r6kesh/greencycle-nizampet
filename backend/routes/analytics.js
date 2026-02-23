const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route GET /api/analytics/dashboard
// @desc Get dashboard stats (admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalBookings,
            todayBookings,
            pendingBookings,
            completedBookings,
            totalUsers,
            totalAgents,
            monthlyRevenue,
            todayRevenue
        ] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ createdAt: { $gte: today } }),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'completed' }),
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'agent' }),
            Booking.aggregate([
                { $match: { status: 'completed', completedAt: { $gte: thisMonth } } },
                { $group: { _id: null, total: { $sum: '$finalAmount' } } }
            ]),
            Booking.aggregate([
                { $match: { status: 'completed', completedAt: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$finalAmount' } } }
            ])
        ]);

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'name phone')
            .sort('-createdAt')
            .limit(10);

        // Status distribution
        const statusDistribution = await Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Weekly trend (last 7 days)
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyTrend = await Booking.aggregate([
            { $match: { createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$finalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalBookings,
                todayBookings,
                pendingBookings,
                completedBookings,
                totalUsers,
                totalAgents,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                todayRevenue: todayRevenue[0]?.total || 0,
                recentBookings,
                statusDistribution,
                weeklyTrend
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/analytics/revenue
// @desc Get revenue analytics (admin)
router.get('/revenue', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { period = 'monthly' } = req.query;

        let dateFormat = '%Y-%m';
        if (period === 'daily') dateFormat = '%Y-%m-%d';
        if (period === 'weekly') dateFormat = '%Y-%U';

        const revenue = await Booking.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$completedAt' } },
                    revenue: { $sum: '$finalAmount' },
                    bookings: { $sum: 1 },
                    avgAmount: { $avg: '$finalAmount' }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
        ]);

        // Category-wise revenue
        const categoryRevenue = await Booking.aggregate([
            { $match: { status: 'completed' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.categoryName',
                    revenue: { $sum: '$items.amount' },
                    totalWeight: { $sum: '$items.actualWeight' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json({ success: true, data: { revenue, categoryRevenue } });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/analytics/export
// @desc Export bookings as CSV (admin)
router.get('/export', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { from, to, status } = req.query;
        const query = {};

        if (from && to) {
            query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
        }
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('user', 'name phone')
            .populate('agent', 'name phone')
            .sort('-createdAt');

        // Generate CSV
        const headers = 'Booking ID,Customer,Phone,Address,Date,Time Slot,Status,Items,Est. Amount,Final Amount,Payment Method,Payment Status,Agent\n';
        const rows = bookings.map(b => {
            const items = b.items.map(i => `${i.categoryName}:${i.estimatedWeight}kg`).join('; ');
            return `${b.bookingId},${b.user?.name || 'N/A'},${b.user?.phone || 'N/A'},"${b.address?.fullAddress || ''}",${new Date(b.scheduledDate).toLocaleDateString()},${b.timeSlot},${b.status},"${items}",${b.estimatedAmount},${b.finalAmount},${b.paymentMethod},${b.paymentStatus},${b.agent?.name || 'Unassigned'}`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings-export.csv');
        res.send(headers + rows);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
