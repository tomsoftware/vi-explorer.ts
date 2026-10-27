import { createApp } from 'vue';
import { router } from './router';
import './colors.css';
import './style.css';
import App from './app.vue';
import Modal from './components/modal.vue';

// Import and register the custom hex-view element
import '@tomsoftware/hex-view-control';

const app = createApp(App);

app.component('Modal', Modal);
app.use(router);
app.mount('#app');
