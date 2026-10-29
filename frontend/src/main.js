import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import { initTheme } from './services/theme';

initTheme();

createApp(App).use(router).mount('#app');
