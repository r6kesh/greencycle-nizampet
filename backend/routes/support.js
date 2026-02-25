const express = require('express');
const router = express.Router();

// Mock AI behavior for now - normally this would call Google Gemini API
const getAIResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('price') || q.includes('rate')) {
        return "Our current scrap rates are: Paper (₹12/kg), Iron (₹28/kg), Plastic (₹15/kg). Rates can vary slightly by quality. You can see the full list in the 'Categories' section!";
    }
    if (q.includes('schedule') || q.includes('book')) {
        return "Booking a pickup is easy! Just go to the Home screen, select 'Book Pickup', choose your categories, and pick a time slot that works for you.";
    }
    if (q.includes('where') || q.includes('location') || q.includes('nizampet')) {
        return "We currently serve the Nizampet and surrounding areas. Our collection agents come directly to your doorstep!";
    }
    if (q.includes('hello') || q.includes('hi')) {
        return "Hi there! I'm the GreenCycle AI Assistant. How can I help you save the planet today? ♻️";
    }

    return "That's a great question! For specific queries about your bookings, you can contact our support team at +91 83091 08691. How else can I help you today?";
};

// @route POST /api/support/chat
// @desc AI Customer Support Chat
router.post('/chat', async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        const response = getAIResponse(message);

        // Simulate network delay for "thinking" feel
        setTimeout(() => {
            res.json({
                success: true,
                data: {
                    reply: response,
                    sender: 'GreenBot'
                }
            });
        }, 800);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
