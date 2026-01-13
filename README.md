# Family Expense Tracker Backend

This is the Node.js/Express backend for the Family Expense Tracker.
It uses Google Sheets as a database and supports automatic archival to Excel.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in the details:
    *   `FAMILY_PIN` & `ADMIN_PIN`: 4-digit numeric pins.
    *   `GOOGLE_SHEETS_ID`: From your Google Sheet URL.
    *   `GOOGLE_SERVICE_ACCOUNT_EMAIL`: From Google Cloud Console.
    *   `GOOGLE_PRIVATE_KEY`: From Google Cloud Console.

3.  **Google Sheets Setup**:
    The service account must have **Editor** access to the sheet.
    The Sheet must have two tabs:
    *   `Expenses` (Header: id, date, memberName, category, description, amount, month, createdAt)
    *   `MonthlyBudgets` (Header: month, totalBudget, totalSpent, remainingBudget, lastUpdated)

## Running

*   **Development**:
    ```bash
    npm run dev
    ```
*   **Production**:
    ```bash
    npm start
    ```

## API Endpoints

*   `POST /api/expenses` (Requires `X-FAMILY-PIN`)
*   `GET /api/expenses?month=YYYY-MM` (Requires `X-FAMILY-PIN`)
*   `GET /api/dashboard?month=YYYY-MM` (Requires `X-FAMILY-PIN`)
*   `GET /api/budget?month=YYYY-MM` (Requires `X-FAMILY-PIN`)
*   `POST /api/budget` (Requires `X-ADMIN-PIN` & `X-FAMILY-PIN`)

## Archival System

Automatic archival triggers when the `Expenses` sheet exceeds 40,000 rows.
Old records are saved to an `.xlsx` file locally and removed from Sheets.
