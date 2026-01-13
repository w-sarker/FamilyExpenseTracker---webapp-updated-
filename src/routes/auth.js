const express = require('express');
const router = express.Router();
const config = require('../config');

// POST /api/auth/verify-pin
router.post('/verify-pin', (req, res) => {
    const { pin } = req.body;

    // Check against Family PIN
    if (pin && pin.toString() === config.familyPin.toString()) {
        return res.json({ success: true, role: 'family' });
    }

    // Check against Admin PIN (optional, if we want to allow admin login here too)
    if (pin && pin.toString() === config.adminPin.toString()) {
        return res.json({ success: true, role: 'admin' });
    }

    return res.status(401).json({ error: 'Invalid PIN' });
});

module.exports = router;
