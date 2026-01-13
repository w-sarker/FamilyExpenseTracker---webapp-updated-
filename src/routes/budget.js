const express = require('express');
const router = express.Router();
const { requireFamilyPin, requireAdminPin } = require('../middleware/authMiddleware');
const sheetsService = require('../services/sheetsService');
const { validateBudget } = require('../utils/validation');
const { isValidMonth } = require('../utils/dateUtils');

// GET /api/budget?month=YYYY-MM
// Accessible by Family
router.get('/', requireFamilyPin, async (req, res) => {
    try {
        const { month } = req.query;
        if (!month || !isValidMonth(month)) {
            return res.status(400).json({ error: 'Invalid or missing month parameter (YYYY-MM)' });
        }

        console.log(`[Budget Route] Fetching budget for month: ${month}`);
        const budgets = await sheetsService.getAllBudgets();
        console.log(`[Budget Route] Found ${budgets.length} budget records total`);
        console.log(`[Budget Route] Available months:`, budgets.map(b => b.month));
        
        const budget = budgets.find(b => b.month === month);

        if (budget) {
            console.log(`[Budget Route] Found budget:`, budget);
            res.json(budget);
        } else {
            console.log(`[Budget Route] No budget found for ${month}, returning zeros`);
            // Return zeros if not found, or 404? 
            // User says "Get Monthly Budget Summary" response format.
            // If no budget set, better to return default structure
            res.json({
                month,
                totalBudget: 0,
                totalSpent: 0,
                remainingBudget: 0
            });
        }
    } catch (err) {
        console.error('[Budget Route] Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/budget
// Admin Only
router.post('/', requireAdminPin, async (req, res) => {
    try {
        const budgetData = req.body;

        const error = validateBudget(budgetData);
        if (error) {
            return res.status(400).json({ error });
        }

        await sheetsService.setBudget(budgetData.month, budgetData.totalBudget);

        res.json({ message: 'Budget updated successfully', ...budgetData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
