const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'Home' },
    fullAddress: { type: String, required: true },
    landmark: String,
    city: { type: String, default: 'Nizampet' },
    pincode: String,
    latitude: Number,
    longitude: Number,
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    password: String,
    role: {
        type: String,
        enum: ['customer', 'agent', 'admin'],
        default: 'customer'
    },
    avatar: String,
    addresses: [addressSchema],
    fcmToken: String,
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpiry: Date,
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    loyaltyPoints: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalPickups: { type: Number, default: 0 },
    // Agent specific fields
    agentArea: String,
    agentVehicle: String,
    agentRating: { type: Number, default: 5.0 },
    agentIsAvailable: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Generate referral code before save
userSchema.pre('save', function (next) {
    if (!this.referralCode) {
        this.referralCode = 'GC' + this.phone.slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
