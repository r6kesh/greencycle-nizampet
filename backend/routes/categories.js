const express = require('express');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route GET /api/categories
// @desc Get all active categories (public)
router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('sortOrder');
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/categories/all
// @desc Get ALL categories including inactive (admin)
router.get('/all', protect, authorize('admin'), async (req, res, next) => {
    try {
        const categories = await Category.find().sort('sortOrder');
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        next(error);
    }
});

// @route GET /api/categories/:id
// @desc Get single category
router.get('/:id', async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
});

// @route POST /api/categories
// @desc Create category (admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
});

// @route PUT /api/categories/:id
// @desc Update category (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        Object.assign(category, req.body);
        await category.save();

        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
});

// @route DELETE /api/categories/:id
// @desc Delete category (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
