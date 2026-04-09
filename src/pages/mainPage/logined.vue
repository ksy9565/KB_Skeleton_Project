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
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';

const transactionStore = useTransactionStore();
const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.currentUser) {
    await transactionStore.fetchTransactions();
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

const calendarDays = [
  ['', '', '', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9', '10', '11'],
  ['12', '13', '14', '15', '16', '17', '18'],
  ['19', '20', '21', '22', '23', '24', '25'],
  ['26', '27', '28', '29', '30', '', ''],
];

const recentTransactions = [
  { type: '지출', title: '점심 식사', amount: '-12,000원', date: '2026-04-08' },
  { type: '수입', title: '급여', amount: '+3,000,000원', date: '2026-04-05' },
  { type: '지출', title: '교통비', amount: '-9,500원', date: '2026-04-04' },
  { type: '지출', title: '생활 용품', amount: '-39,000원', date: '2026-04-03' },
  { type: '지출', title: '정기 구독', amount: '-15,000원', date: '2026-04-01' },
];

const weeklyBars = computed(() => transactionStore.getWeeklyStats());

const monthlyBars = [
  { label: '1월', income: 36, expense: 18 },
  { label: '2월', income: 42, expense: 24 },
  { label: '3월', income: 38, expense: 21 },
  { label: '4월', income: 55, expense: 26 },
];

const fixedExpenses = [
  { label: '주거', value: '월세', amount: '~', helper: '자동이체' },
  { label: '쇼핑', value: '정기 구독', amount: '~', helper: '정기 결제' },
  { label: '교통', value: '교통카드', amount: '~', helper: '충전 예정' },
  { label: '총계', value: '고정 지출', amount: '~', helper: '월간 합산' },
];
</script>

<template>
  <div class="dashboard-shell">
    <DashboardSidebar :groups="navigationGroups" />

    <section class="content-area">
      <DashboardTopSummary
        title="이번 달 자산 흐름"
        :month="transactionStore.currentMonth.replace('-', '년 ') + '월'"
        balance-label="잔액"
        :balance-value="`${transactionStore.totalBalance.toLocaleString()}원`"
        :summary-cards="summaryCards"
      />

      <section class="panel-grid upper-grid">
        <DashboardCalendarPanel :days="calendarDays" />
        <DashboardRecentTransactions :items="recentTransactions" />
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
  </div>
</template>
