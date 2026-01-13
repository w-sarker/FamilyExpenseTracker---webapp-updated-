/**
 * Archival Service
 * Monitors row count and archives old data to Excel files locally.
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const config = require('../config');
const sheetsService = require('./sheetsService');

const ARCHIVE_DIR = path.join(__dirname, '../../archives');

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR);
}

/**
 * Checks row count and performs archival if threshold exceeded.
 */
async function checkAndArchive() {
    try {
        const currentCount = await sheetsService.getExpenseCount();
        console.log(`[Archival] Current row count: ${currentCount}`);

        if (currentCount >= config.thresholds.maxRows) {
            console.log(`[Archival] Threshold ${config.thresholds.maxRows} reached. Initiating archival...`);
            await performArchival();
        }
    } catch (error) {
        console.error("[Archival] Error checking/archiving:", error);
    }
}

async function performArchival() {
    const countToArchive = config.thresholds.archiveChunk; // 30000

    // 1. Fetch Oldest Rows
    // Range: A2 : H(Count+1)
    // Rows are 1-based in A1 notation. 
    // We want first 30000 data rows: A2 to H30001
    const range = `${sheetsService.SHEET_EXPENSES}!A2:H${countToArchive + 1}`;

    console.log(`[Archival] Fetching ${countToArchive} rows...`);
    const rawData = await sheetsService.getRawData(range);

    if (!rawData || rawData.length === 0) {
        console.warn("[Archival] No data found to archive.");
        return;
    }

    // 2. Create Excel File
    const headers = ['id', 'date', 'memberName', 'category', 'description', 'amount', 'month', 'createdAt'];
    const workSheetData = [headers, ...rawData];
    const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
    const workBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheet, "Archived Expenses");

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `archive_expenses_${timestamp}.xlsx`;
    const filePath = path.join(ARCHIVE_DIR, filename);

    xlsx.writeFile(workBook, filePath);
    console.log(`[Archival] Saved archive to ${filePath}`);

    // 3. Delete from Google Sheets
    // Indices are 0-based. Header is 0. 
    // Data starts at 1. 
    // We delete form 1 to 1 + count
    console.log(`[Archival] Deleting ${countToArchive} rows from Sheets...`);
    await sheetsService.deleteRows(1, 1 + countToArchive);

    console.log("[Archival] Process Complete.");
}

module.exports = {
    checkAndArchive
};
