import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../pages/main.vue';
import LoginPage from '../pages/login/loginPage.vue';
import LedgerPage from '../pages/ledger/ledgerPage.vue';
import RegisterPage from '../pages/login/register.vue';
import AnalysisPage from '../pages/analysis/analysisPage.vue';
import SettingsPage from '../pages/settings/settingsPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainPage,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
    },
    {
      path: '/ledger',
      name: 'ledger',
      component: LedgerPage,
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisPage,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsPage,
    },
  ],
});

export default router;
