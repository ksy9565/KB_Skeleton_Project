import './assets/main.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore(pinia);
authStore.initializeAuth();

app.use(router);
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
});
app.mount('#app');
