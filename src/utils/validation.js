/**
 * Validation Logic
 * Enforces business rules for inputs.
 */

const { isValidDate, isValidMonth } = require('./dateUtils');

const ALLOWED_CATEGORIES = [
    'Food',
    'Transport',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Education',
    'Shopping',
    'Other'
];

/**
 * Validates expense payload
 * @param {object} expense 
 * @returns {string|null} - Error message or null if valid
 */
function validateExpense(expense) {
    if (!expense) return "Missing expense data";

    if (!expense.date || !isValidDate(expense.date)) {
        return "Invalid or missing date (Expected DD/MM/YYYY)";
    }

    if (!expense.memberName || typeof expense.memberName !== 'string' || expense.memberName.trim() === '') {
        return "Missing or empty memberName";
    }

    if (!ALLOWED_CATEGORIES.includes(expense.category)) {
        return `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`;
    }

    if (expense.description !== undefined && typeof expense.description !== 'string') {
        return "Description must be a string";
    }

    if (typeof expense.amount !== 'number' || expense.amount <= 0) {
        return "Amount must be a positive number";
    }

    return null;
}

/**
 * Validates budget payload
 * @param {object} budget 
 * @returns {string|null} - Error message or null if valid
 */
function validateBudget(budget) {
    if (!budget) return "Missing budget data";

    if (!budget.month || !isValidMonth(budget.month)) {
        return "Invalid or missing month (Expected YYYY-MM)";
    }

    if (typeof budget.totalBudget !== 'number' || budget.totalBudget < 0) {
        return "Total Budget must be a non-negative number";
    }

    return null;
}

module.exports = {
    validateExpense,
    validateBudget,
    ALLOWED_CATEGORIES
};
