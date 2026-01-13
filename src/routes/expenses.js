const express = require('express');
const router = express.Router();
const { requireFamilyPin } = require('../middleware/authMiddleware');
const sheetsService = require('../services/sheetsService');
const archivalService = require('../services/archivalService');
const { validateExpense } = require('../utils/validation');
const { getMonthFromDate, isValidMonth } = require('../utils/dateUtils');

// GET /api/expenses?month=YYYY-MM
router.get('/', requireFamilyPin, async (req, res) => {
    try {
        const { month } = req.query;
        if (!month || !isValidMonth(month)) {
            return res.status(400).json({ error: 'Invalid or missing month parameter (YYYY-MM)' });
        }

        console.log(`[Expenses Route] Fetching expenses for month: ${month}`);
        const allRows = await sheetsService.getAllExpensesRaw();
        console.log(`[Expenses Route] Total rows in sheet: ${allRows.length}`);
        
        // Filter: row[6] is month
        const expenses = allRows
            .filter(row => {
                const rowMonth = row[6];
                const matches = rowMonth === month;
                if (!matches && rowMonth) {
                    console.log(`[Expenses Route] Row month mismatch: found "${rowMonth}", expected "${month}"`);
                }
                return matches;
            })
            .map(row => ({
                id: row[0],
                date: row[1],
                memberName: row[2],
                category: row[3],
                description: row[4],
                amount: Number(row[5]),
                month: row[6],
                createdAt: row[7]
            }));

        console.log(`[Expenses Route] Found ${expenses.length} expenses for ${month}`);
        res.json({ expenses });
    } catch (err) {
        console.error('[Expenses Route] Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/expenses
router.post('/', requireFamilyPin, async (req, res) => {
    try {
        const expenseData = req.body;

        // Validation
        const error = validateExpense(expenseData);
        if (error) {
            return res.status(400).json({ error });
        }

        // Derive month
        try {
            expenseData.month = getMonthFromDate(expenseData.date);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }

        // Add to Sheets
        const result = await sheetsService.addExpense(expenseData);

        // Trigger Archival Check (Fire and Forget)
        archivalService.checkAndArchive().catch(err => console.error("Archival Trigger Error:", err));

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
