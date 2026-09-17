import { createApp } from 'vue';
import { router } from './router';
import './style.css';
import App from './app.vue';

// Import and register the custom hex-view element
import '@tomsoftware/hex-view-control';

createApp(App)
    .use(router)
    .mount('#app');
