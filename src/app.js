const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');

const expensesRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budget');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/expenses', expensesRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Serve Frontend Static Files (from frontend/dist)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve index.html for React SPA
app.get('*', (req, res) => {
    // Check if it's an API route that somehow leaked
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start Server
if (require.main === module) {
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
}

module.exports = app;
