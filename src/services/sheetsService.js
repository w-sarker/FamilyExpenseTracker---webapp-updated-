/**
 * Sheets Service
 * Handles all interactions with Google Sheets:
 * - reading/writing expenses
 * - reading/writing budgets
 * - recalculating totals
 * - deleting rows (for archival)
 */

const { google } = require('googleapis');
const config = require('../config');
const { getIsoTimestamp } = require('../utils/dateUtils');
const { v4: uuidv4 } = require('uuid');

/**
 * Safely parse a number from Google Sheets which may return formatted strings
 * like "৳ 50,000" or "50,000.00"
 * @param {string|number} val 
 * @returns {number}
 */
function parseNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Strip currency symbols, commas, spaces, and any non-numeric chars except . and -
    const cleaned = String(val).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    console.log(`[parseNumber] Input: "${val}" -> Cleaned: "${cleaned}" -> Parsed: ${parsed}`);
    return isNaN(parsed) ? 0 : parsed;
}

// Scopes for reading and writing to Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Sheet Names
const SHEET_EXPENSES = 'Expenses';
const SHEET_BUDGETS = 'MonthlyBudgets';

// Header row mapping (for reference, code uses index)
// Expenses: id, date, memberName, category, description, amount, month, createdAt
// Budgets: month, totalBudget, totalSpent, remainingBudget, lastUpdated

let authClient = null;
let sheetsInstance = null;

async function getAuthClient() {
    if (authClient) return authClient;

    // If running locally without env vars, this might fail, so we handle gracefully? 
    // No, we expect them to be there.
    if (!config.google.serviceAccountEmail || !config.google.privateKey) {
        console.error("Missing Google Credentials in Config");
        throw new Error("Missing Google Service Account Credentials");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: config.google.serviceAccountEmail,
            private_key: config.google.privateKey,
        },
        scopes: SCOPES,
    });

    authClient = await auth.getClient();
    sheetsInstance = google.sheets({ version: 'v4', auth: authClient });
    return authClient;
}

// Ensure columns exist (Optional, but good for safety)
// We assume the user created the sheet as per README.

/**
 * Appends a new expense and triggers budget recalculation.
 * @param {object} expenseData 
 */
async function addExpense(expenseData) {
    await getAuthClient();

    const newId = uuidv4();
    const createdAt = getIsoTimestamp();

    const row = [
        newId,
        expenseData.date,
        expenseData.memberName,
        expenseData.category,
        expenseData.description,
        expenseData.amount, // stored as number
        expenseData.month,
        createdAt
    ];

    // 1. Append to Expenses Sheet
    await sheetsInstance.spreadsheets.values.append({
        spreadsheetId: config.google.spreadsheetId,
        range: `${SHEET_EXPENSES}!A:H`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [row]
        }
    });

    // 2. Recalculate Budget for this month
    await recalculateBudgetSync(expenseData.month);

    return { id: newId, ...expenseData, createdAt };
}

/**
 * Core Logic: Recalculate Total Spent & Remaining Budget for a specific month.
 * This reads ALL expenses for that month (inefficient for large data, but standard for Sheets)
 */
async function recalculateBudgetSync(month) {
    await getAuthClient();

    // 1. Get Budget Record
    const budgets = await getAllBudgets();
    const budgetIndex = budgets.findIndex(b => b.month === month);
    console.log(`[recalculateBudgetSync] Starting for month: ${month}. Found existing budget index: ${budgetIndex}`);

    let budgetRecord = budgetIndex >= 0 ? budgets[budgetIndex] : null;

    // If no budget exists for this month, can we track spending?
    // User Requirements say: "Creates budget if not exists" in POST /budget
    // But for "Add Expense", if budget doesn't exist, we might just track it or create a default 0 budget?
    // Let's assume we update if it exists, or create one with 0 allocation if not.

    if (!budgetRecord) {
        console.log(`[recalculateBudgetSync] No budget record found for ${month}, creating temporary one.`);
        // Create a temporary budget record with 0 allocation to track spending
        // Note: This does NOT effectively "create" it in the sheet until we write back
        budgetRecord = {
            month: month,
            totalBudget: 0,
            totalSpent: 0,
            remainingBudget: 0,
            lastUpdated: getIsoTimestamp()
        };
    }

    // 2. Aggregate Expenses for this month
    // We read ALL expenses. 
    // Optimization: In a real DB we'd query. In Sheets we scan.
    const allExpenses = await getAllExpensesRaw();
    console.log(`[recalculateBudgetSync] Total expenses in sheet: ${allExpenses.length}`);
    // Filter by month (Column Index 6 -> G)
    // Row structure: [id, date, member, category, desc, amount, month, created]
    //                  0   1     2       3        4      5       6       7

    const monthExpenses = allExpenses.filter(row => {
        const rowMonth = row[6];
        const matches = rowMonth === month;
        return matches;
    });
    console.log(`[recalculateBudgetSync] Expenses matching ${month}: ${monthExpenses.length}`);

    const totalSpent = monthExpenses.reduce((sum, row) => sum + parseNumber(row[5]), 0);

    console.log(`[Backend] Recalculated budget for ${month}: Spent ${totalSpent} / Budget ${budgetRecord.totalBudget}`);

    // 3. Update Record
    budgetRecord.totalSpent = totalSpent;
    budgetRecord.remainingBudget = budgetRecord.totalBudget - totalSpent;
    budgetRecord.lastUpdated = getIsoTimestamp();

    console.log(`[recalculateBudgetSync] New State for ${month}:`, budgetRecord);

    // 4. Write back to Sheets
    // If it was new, append. If existing, update row.
    if (budgetIndex >= 0) {
        // Update existing row
        // Row number = budgetIndex + 2 (assuming header is row 1, and index 0 is row 2)
        const rowNumber = budgetIndex + 2;
        const range = `${SHEET_BUDGETS}!A${rowNumber}:E${rowNumber}`;
        const values = [[
            budgetRecord.month,
            budgetRecord.totalBudget,
            budgetRecord.totalSpent,
            budgetRecord.remainingBudget,
            budgetRecord.lastUpdated
        ]];

        await sheetsInstance.spreadsheets.values.update({
            spreadsheetId: config.google.spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

    } else {
        // Append new
        const values = [[
            budgetRecord.month,
            budgetRecord.totalBudget,
            budgetRecord.totalSpent,
            budgetRecord.remainingBudget,
            budgetRecord.lastUpdated
        ]];

        await sheetsInstance.spreadsheets.values.append({
            spreadsheetId: config.google.spreadsheetId,
            range: `${SHEET_BUDGETS}!A:E`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });
    }
}

/**
 * Sets (Create/Update) a Budget for a month. Calls recalculate logic.
 */
async function setBudget(month, totalBudget) {
    await getAuthClient();

    // Check if exists
    const budgets = await getAllBudgets();
    const budgetIndex = budgets.findIndex(b => b.month === month);

    // If exists, just update the totalBudget field, then recalculate totals
    if (budgetIndex >= 0) {
        const rowNumber = budgetIndex + 2;
        // We only update TotalBudget column (B)
        // Actually, safer to just run recalculate logic with the new total.

        // Let's manually update the object first to pass to logic? 
        // No, logic reads from sheet. 
        // We should write the new TotalBudget first.

        await sheetsInstance.spreadsheets.values.update({
            spreadsheetId: config.google.spreadsheetId,
            range: `${SHEET_BUDGETS}!B${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[totalBudget]] }
        });
    } else {
        // Create new row with TotalBudget, others 0
        const values = [[
            month,
            totalBudget,
            0,
            totalBudget, // remaining
            getIsoTimestamp()
        ]];
        await sheetsInstance.spreadsheets.values.append({
            spreadsheetId: config.google.spreadsheetId,
            range: `${SHEET_BUDGETS}!A:E`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });
    }

    // Now trigger full recalc to ensure spent is accurate
    await recalculateBudgetSync(month);
}

// --- Helpers ---

// Returns array of arrays (Rows)
async function getAllExpensesRaw() {
    await getAuthClient();
    const res = await sheetsInstance.spreadsheets.values.get({
        spreadsheetId: config.google.spreadsheetId,
        range: `${SHEET_EXPENSES}!A2:H`, // Skip header
    });
    return res.data.values || [];
}

// Returns structued objects
async function getAllBudgets() {
    await getAuthClient();
    const res = await sheetsInstance.spreadsheets.values.get({
        spreadsheetId: config.google.spreadsheetId,
        range: `${SHEET_BUDGETS}!A2:E`, // Skip header
    });

    const rows = res.data.values || [];

    return rows.map((row, idx) => {
        const budget = {
            month: row[0],
            totalBudget: parseNumber(row[1]),
            totalSpent: parseNumber(row[2]),
            remainingBudget: parseNumber(row[3]),
            lastUpdated: row[4]
        };
        // Verbose logging removed
        return budget;
    });
}

/**
 * Gets aggregated dashboard data
 */
async function getDashboardData(month) {
    await getAuthClient();

    // 1. Budget Summary
    let budgets = await getAllBudgets();
    let budget = budgets.find(b => b.month === month);
    if (!budget) {
        budget = { month, totalBudget: 0, totalSpent: 0, remainingBudget: 0, lastUpdated: null };
    }

    // 2. Expenses
    const allRows = await getAllExpensesRaw();
    const monthRows = allRows.filter(row => row && row[6] === month);

    // 3. Aggregations with null safety
    const categoryBreakdown = {};
    const memberBreakdown = {};
    const dailyTotalsMap = {};

    monthRows.forEach(row => {
        // Row: [id, date, member, category, desc, amount, month, created]
        const mem = row[2] || 'Unknown';
        const cat = row[3] || 'Other';
        const amt = parseNumber(row[5]);
        const date = row[1] || '';

        if (cat) {
            if (!categoryBreakdown[cat]) categoryBreakdown[cat] = 0;
            categoryBreakdown[cat] += amt;
        }

        if (mem) {
            if (!memberBreakdown[mem]) memberBreakdown[mem] = 0;
            memberBreakdown[mem] += amt;
        }

        if (date) {
            if (!dailyTotalsMap[date]) dailyTotalsMap[date] = 0;
            dailyTotalsMap[date] += amt;
        }
    });

    // Sort daily totals by date (DD/MM/YYYY format)
    const dailyTotals = Object.keys(dailyTotalsMap)
        .sort((a, b) => {
            const [d1, m1, y1] = a.split('/').map(Number);
            const [d2, m2, y2] = b.split('/').map(Number);
            return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        })
        .map(date => ({
            date,
            amount: dailyTotalsMap[date]
        }));

    // Return FLAT structure matching API contract
    return {
        month: budget.month,
        totalBudget: budget.totalBudget,
        totalSpent: budget.totalSpent,
        remainingBudget: budget.remainingBudget,
        categoryBreakdown,
        memberBreakdown,
        dailyTotals
    };
}

// --- Archival Helpers ---

async function getExpenseCount() {
    const rows = await getAllExpensesRaw();
    return rows.length;
}

// Basic export function for archival service to use
// range = 'A2:H30001'
async function getRawData(range) {
    await getAuthClient();
    const res = await sheetsInstance.spreadsheets.values.get({
        spreadsheetId: config.google.spreadsheetId,
        range: range,
    });
    return res.data.values || [];
}

/**
 * Delete rows from start index to end index (0-based)
 * @param {number} startIndex 
 * @param {number} endIndex 
 */
async function deleteRows(startIndex, endIndex) {
    // startIndex uses 0-index. 
    // In API, it's typically:
    // "startIndex": 1 (Row 2), "endIndex": 30001 (Row 30002)
    // Be careful with headers (Row 0 is header).

    await getAuthClient();

    // Retrieve sheetId for "Expenses"
    const meta = await sheetsInstance.spreadsheets.get({
        spreadsheetId: config.google.spreadsheetId
    });
    const sheet = meta.data.sheets.find(s => s.properties.title === SHEET_EXPENSES);
    const sheetId = sheet.properties.sheetId;

    const request = {
        deleteDimension: {
            range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: startIndex,
                endIndex: endIndex
            }
        }
    };

    await sheetsInstance.spreadsheets.batchUpdate({
        spreadsheetId: config.google.spreadsheetId,
        resource: {
            requests: [request]
        }
    });
}

module.exports = {
    addExpense,
    setBudget,
    getAllBudgets,
    getDashboardData,
    getAllExpensesRaw,
    getExpenseCount,
    getRawData,
    deleteRows,
    SHEET_EXPENSES
};
