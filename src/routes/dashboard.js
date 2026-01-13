const express = require('express');
const router = express.Router();
const { requireFamilyPin } = require('../middleware/authMiddleware');
const sheetsService = require('../services/sheetsService');
const { isValidMonth } = require('../utils/dateUtils');

// GET /api/dashboard?month=YYYY-MM
router.get('/', requireFamilyPin, async (req, res) => {
    try {
        const { month } = req.query;
        if (!month || !isValidMonth(month)) {
            return res.status(400).json({ error: 'Invalid or missing month parameter (YYYY-MM)' });
        }

        const data = await sheetsService.getDashboardData(month);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
