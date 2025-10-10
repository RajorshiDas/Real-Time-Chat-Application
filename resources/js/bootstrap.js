import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Function to get CSRF token
function getCsrfToken() {
    let token = document.head.querySelector('meta[name="csrf-token"]');
    return token ? token.content : null;
}

// Set initial CSRF token
let csrfToken = getCsrfToken();
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
} else {
    console.error('CSRF token not found');
}

// Intercept requests to ensure fresh CSRF token
window.axios.interceptors.request.use(function (config) {
    const token = getCsrfToken();
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Enable Pusher logging for debugging
Pusher.logToConsole = true;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 6001,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 6001,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});

// Log Echo configuration
console.log('🚀 Echo initialized with config:', {
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 6001,
    key: import.meta.env.VITE_REVERB_APP_KEY
});
