<script setup>
import DashboardCalendarPanel from '@/components/mainPage/DashboardCalendarPanel.vue';
import DashboardCategoryChart from '@/components/mainPage/DashboardCategoryChart.vue';
import DashboardFixedExpenseCard from '@/components/mainPage/DashboardFixedExpenseCard.vue';
import DashboardMonthlyChart from '@/components/mainPage/DashboardMonthlyChart.vue';
import DashboardRecentTransactions from '@/components/mainPage/DashboardRecentTransactions.vue';
import DashboardSidebar from '@/components/mainPage/DashboardSidebar.vue';
import DashboardTopSummary from '@/components/mainPage/DashboardTopSummary.vue';
import DashboardWeeklyChart from '@/components/mainPage/DashboardWeeklyChart.vue';
import DashboardPaymentMethodsChart from '@/components/mainPage/DashboardPaymentMethodsChart.vue';

import '@/styles/mainPage/logined.css';

import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';

const transactionStore = useTransactionStore();
const authStore = useAuthStore();
const router = useRouter();

const isGuest = computed(() => !authStore.isAuthenticated);

const moveToLogin = () => {
  router.push({ name: 'login' });
};

onMounted(async () => {
  if (authStore.currentUser) {
    await Promise.all([
      transactionStore.fetchTransactions(),
      transactionStore.fetchBudgetForCurrentMonth(),
    ]);
  }
});

const navigationGroups = [
  {
    title: '계정',
    items: ['대시보드', '가계부', '통계', '카드 관리'],
  },
  {
    title: '설정',
    items: ['예산 설정', '카테고리 설정', '알림 설정'],
  },
];

const summaryCards = computed(() => [
  {
    title: '수입',
    value: `${transactionStore.monthlyIncome.toLocaleString()}원`,
  },
  {
    title: '지출',
    value: `${transactionStore.monthlyExpense.toLocaleString()}원`,
  },
  {
    title: '잔액',
    value: `${(transactionStore.monthlyIncome - transactionStore.monthlyExpense).toLocaleString()}원`,
  },
]);

const weeklyBars = computed(() => transactionStore.getWeeklyStats());

const monthlyBars = [
  { label: '1월', income: 36, expense: 18 },
  { label: '2월', income: 42, expense: 24 },
  { label: '3월', income: 38, expense: 21 },
  { label: '4월', income: 55, expense: 26 },
];
</script>

<template>
  <div class="dashboard-shell" :class="{ 'is-guest': isGuest }">
    <DashboardSidebar :groups="navigationGroups" :show-battery="true" />

    <section class="content-area">
      <DashboardTopSummary
        title="이번 달 자산 흐름"
        :month="transactionStore.currentMonth.replace('-', '년 ') + '월'"
        balance-label="잔액"
        :balance-value="`${transactionStore.totalBalance.toLocaleString()}원`"
        :summary-cards="summaryCards"
      />

      <section class="panel-grid upper-grid">
        <DashboardCalendarPanel />
        <DashboardRecentTransactions />
      </section>

      <section class="panel-grid lower-grid">
        <DashboardWeeklyChart :items="weeklyBars" />
        <DashboardMonthlyChart :items="monthlyBars" />
      </section>

      <section class="panel-grid lower-grid final-grid">
        <DashboardCategoryChart />
        <DashboardPaymentMethodsChart />
        <DashboardFixedExpenseCard :items="fixedExpenses" />
      </section>
    </section>

    <div v-if="isGuest" class="guest-blocker">
      <p>로그인해주세요</p>
      <button type="button" @click="moveToLogin">로그인 하러가기</button>
    </div>
  </div>
</template>
