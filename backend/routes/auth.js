const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

// Generate OTP (6 digits)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route POST /api/auth/send-otp
// @desc Send OTP to phone number
router.post('/send-otp', async (req, res, next) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({ phone, otp, otpExpiry });
        } else {
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        }

        // In production, send OTP via SMS service (Twilio, MSG91, etc.)
        // For development, we return it in response
        console.log(`📱 OTP for ${phone}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            ...(process.env.NODE_ENV === 'development' && { otp }) // Only in dev
        });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/auth/verify-otp
// @desc Verify OTP and login/register
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Check OTP validity
        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        // Mark as verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                    addresses: user.addresses,
                    loyaltyPoints: user.loyaltyPoints,
                    referralCode: user.referralCode,
                    isVerified: user.isVerified
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/auth/admin-login
// @desc Admin login with phone + password
router.post('/admin-login', async (req, res, next) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Phone and password required' });
        }

        const user = await User.findOne({ phone, role: { $in: ['admin', 'agent'] } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.password) {
            return res.status(401).json({ success: false, message: 'Password not set. Contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/auth/profile
// @desc Get current user profile
router.get('/profile', protect, async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

// @route PUT /api/auth/profile
// @desc Update user profile
router.put('/profile', protect, async (req, res, next) => {
    try {
        const { name, email, fcmToken } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (fcmToken) updates.fcmToken = fcmToken;

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true, runValidators: true
        }).select('-otp -otpExpiry -password');

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/auth/address
// @desc Add address
router.post('/address', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const { fullAddress, landmark, city, pincode, latitude, longitude, label } = req.body;

        if (!fullAddress) {
            return res.status(400).json({ success: false, message: 'Full address is required' });
        }

        // If this is the first address or set as default
        const isDefault = user.addresses.length === 0;

        user.addresses.push({
            label: label || 'Home',
            fullAddress, landmark, city, pincode, latitude, longitude,
            isDefault
        });

        await user.save();
        res.json({ success: true, data: user.addresses });
    } catch (error) {
        next(error);
    }
});

// @route DELETE /api/auth/address/:addressId
// @desc Delete address
router.delete('/address/:addressId', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );
        await user.save();
        res.json({ success: true, data: user.addresses });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
