const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    categoryName: String,
    estimatedWeight: { type: Number, required: true },
    actualWeight: Number,
    pricePerKg: Number,
    amount: Number
});

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [bookingItemSchema],
    address: {
        fullAddress: { type: String, required: true },
        landmark: String,
        city: String,
        pincode: String,
        latitude: Number,
        longitude: Number
    },
    scheduledDate: { type: Date, required: true },
    timeSlot: {
        type: String,
        required: true,
        enum: ['8AM-10AM', '10AM-12PM', '12PM-2PM', '2PM-4PM', '4PM-6PM', '6PM-8PM']
    },
    notes: String,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'assigned', 'out_for_pickup', 'completed', 'cancelled'],
        default: 'pending'
    },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    estimatedAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'razorpay'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    photos: [String],
    receipt: String,
    completedAt: Date,
    cancelReason: String,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }]
}, {
    timestamps: true
});

// Auto-generate booking ID
bookingSchema.pre('save', function (next) {
    if (!this.bookingId) {
        const date = new Date();
        const prefix = 'GC';
        const dateStr = date.getFullYear().toString().slice(-2) +
            String(date.getMonth() + 1).padStart(2, '0') +
            String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        this.bookingId = `${prefix}${dateStr}${random}`;
    }
    next();
});

// Track status changes
bookingSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
        if (this.status === 'completed') {
            this.completedAt = new Date();
        }
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
