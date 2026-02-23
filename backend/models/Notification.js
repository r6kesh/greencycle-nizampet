const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
        type: String,
        enum: ['booking_confirmed', 'booking_assigned', 'out_for_pickup', 'pickup_completed', 'payment_received', 'promotional', 'general'],
        default: 'general'
    },
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    isBroadcast: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
