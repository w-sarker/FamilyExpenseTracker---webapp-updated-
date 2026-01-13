/**
 * Authentication Middleware
 * Validates API PINs provided in headers.
 */

const config = require('../config');

// Constants for Headers
const HEADER_FAMILY_PIN = 'x-family-pin';
const HEADER_ADMIN_PIN = 'x-admin-pin';

function requireFamilyPin(req, res, next) {
    const pin = req.headers[HEADER_FAMILY_PIN];
    const expectedPin = config.familyPin;

    // Use string comparison to handle slight type variations if any, 
    // but usually headers are strings.
    if (!pin) {
        console.log(`[Auth] Missing PIN header. Headers:`, Object.keys(req.headers).filter(h => h.toLowerCase().includes('pin')));
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing Family PIN' });
    }

    if (pin.toString() !== expectedPin.toString()) {
        console.log(`[Auth] PIN mismatch. Received: "${pin}", Expected: "${expectedPin}"`);
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing Family PIN' });
    }

    console.log(`[Auth] PIN verified successfully for ${req.method} ${req.path}`);
    next();
}

function requireAdminPin(req, res, next) {
    // Admin requires BOTH pins usually, OR just admin logic?
    // Contract says:
    // "X-FAMILY-PIN: 1234"
    // "X-ADMIN-PIN: 9999 (admin-only endpoints)"
    // So we verify both or just Admin? 
    // The contract 5.1 Create / Update Monthly Budget shows BOTH headers.

    const familyPin = req.headers[HEADER_FAMILY_PIN];
    const adminPin = req.headers[HEADER_ADMIN_PIN];

    if (!familyPin || familyPin.toString() !== config.familyPin.toString()) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing Family PIN' });
    }

    if (!adminPin || adminPin.toString() !== config.adminPin.toString()) {
        return res.status(403).json({ error: 'Forbidden: Invalid or missing Admin PIN' });
    }

    next();
}

module.exports = {
    requireFamilyPin,
    requireAdminPin
};
