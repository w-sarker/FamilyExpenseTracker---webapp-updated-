import axios from 'axios';

// Create instance
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL, // Backend URL
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok interstitial for API calls
    },
});

// Request interceptor to add Family PIN
api.interceptors.request.use((config) => {
    const familyPin = localStorage.getItem('FAMILY_PIN');
    if (familyPin) {
        config.headers['X-FAMILY-PIN'] = familyPin;
    }

    // We handle Admin PIN locally in components when needed, or we could add it here if stored
    const adminPin = localStorage.getItem('ADMIN_PIN');
    // Should we store admin pin? The prompt says "Store X-FAMILY-PIN in local storage".
    // For Admin mode, we might just ask for it or store it temporarily?
    // Let's assume we pass Admin PIN manually for admin requests or store it if logged in as admin.
    // For now, let's just do Family PIN which is global.

    return config;
});

export default api;
