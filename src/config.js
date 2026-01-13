require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  familyPin: process.env.FAMILY_PIN,
  adminPin: process.env.ADMIN_PIN,
  google: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  },
  thresholds: {
    maxRows: 40000,
    archiveChunk: 30000, // How many to move to archive
  }
};

if (!config.familyPin || !config.adminPin) {
  console.warn("WARNING: FAMILY_PIN or ADMIN_PIN not set in environment.");
}

module.exports = config;
