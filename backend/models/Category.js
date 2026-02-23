const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    icon: { type: String, default: '📦' },
    image: String,
    pricePerKg: { type: Number, required: true },
    unit: { type: String, default: 'kg', enum: ['kg', 'piece', 'unit'] },
    description: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    color: { type: String, default: '#10B981' },
    minQuantity: { type: Number, default: 1 },
    priceHistory: [{
        price: Number,
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Auto-generate slug
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    // Track price history
    if (this.isModified('pricePerKg')) {
        this.priceHistory.push({ price: this.pricePerKg, date: new Date() });
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
