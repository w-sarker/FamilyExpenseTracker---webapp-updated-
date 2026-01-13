/**
 * Date Utilities
 * Ensures internal consistency for Date handling.
 * Input format: DD/MM/YYYY
 * Month format: YYYY-MM
 */

// Regex for DD/MM/YYYY
const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * Validates if a string is in DD/MM/YYYY format
 * @param {string} dateStr 
 * @returns {boolean}
 */
function isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    return DATE_REGEX.test(dateStr);
}

/**
 * Derives YYYY-MM month string from DD/MM/YYYY
 * @param {string} dateStr - DD/MM/YYYY
 * @returns {string} - YYYY-MM
 * @throws {Error} if date format is invalid
 */
function getMonthFromDate(dateStr) {
    const match = dateStr.match(DATE_REGEX);
    if (!match) {
        throw new Error(`Invalid date format: ${dateStr}. Expected DD/MM/YYYY`);
    }
    const [, day, month, year] = match;
    return `${year}-${month}`;
}

/**
 * Get current timestamp in ISO format
 * @returns {string}
 */
function getIsoTimestamp() {
    return new Date().toISOString();
}

/**
 * Validates YYYY-MM format
 * @param {string} monthStr 
 * @returns {boolean}
 */
function isValidMonth(monthStr) {
    const regex = /^\d{4}-\d{2}$/;
    return regex.test(monthStr);
}


module.exports = {
    isValidDate,
    getMonthFromDate,
    getIsoTimestamp,
    isValidMonth
};
