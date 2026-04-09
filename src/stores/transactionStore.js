import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { transactionService } from '@/services/transactionService';
import { useAuthStore } from './authStore';

import { fetchTransactionsByDateApi } from '@/services/getCategoryService';

export const useTransactionStore = defineStore('transaction', () => {
  // State
  const authStore = useAuthStore();
  const transactions = ref([]);
  const budgets = ref([]);
  const currentMonth = ref(new Date().toISOString().slice(0, 7));

  console.log(authStore.currentUser);
  const isLoading = ref(false);

  // Getters
  // 1. 월별 거래내역 필터링
  const monthlyTransactions = computed(() => {
    return transactions.value.filter((t) =>
      t.date.startsWith(currentMonth.value),
    );
  });

  // 2. 이번 달 총 수입
  const monthlyIncome = computed(() =>
    monthlyTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  // 3. 이번 달 총 지출
  const monthlyExpense = computed(() =>
    monthlyTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  // 4. 총 자산
  const totalBalance = computed(() => {
    const initialBalance = authStore.currentUser?.balance || 0;
    const historySum = transactions.value.reduce((acc, cur) => {
      return cur.type === 'income' ? acc + cur.amount : acc - cur.amount;
    }, 0);
    return initialBalance + historySum;
  });

  // Actions
  // 1. 현재 로그인한 유저의 거래 내역 가져오기
  async function fetchTransactions() {
    const userId = authStore.currentUser?.id;
    if (!userId) {
      console.warn('로그인한 유저 정보가 없어 내역을 불러올 수 없습니다.');
      return;
    }

    try {
      const data = await transactionService.getTransactionsByUserId(userId);
      transactions.value = data;
      console.log('데이터 로드 성공: ', data);
    } catch (error) {
      console.error('데이터 로드 실패: ', error);
    }
  }

  function addTransaction(transaction) {
    // 1. 거래 추가
    transactions.value.push({ ...transaction, id: Date.now() });

    // 2. (선택사항) Auth 스토어의 잔액(balance) 업데이트 로직 연결 가능
  }
  function updateTransaction(id, data) {}

  function deleteTransaction(id) {
    transactions.value = transactions.value.filter((t) => t.id !== id);
  }

  const getRecentTransactions = computed((limit = 10) => {});

  function getWeeklyStats() {
    const weeksInMonth = new Map();

    monthlyTransactions.value.forEach((transaction) => {
      const dayOfMonth = new Date(transaction.date).getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);

      if (!weeksInMonth.has(weekNumber)) {
        weeksInMonth.set(weekNumber, {
          label: `${weekNumber}주`,
          income: 0,
          expense: 0,
        });
      }

      const weeklyStat = weeksInMonth.get(weekNumber);

      if (transaction.type === 'income') {
        weeklyStat.income += transaction.amount;
      }

      if (transaction.type === 'expense') {
        weeklyStat.expense += transaction.amount;
      }
    });

    const lastDayOfMonth = new Date(
      Number(currentMonth.value.slice(0, 4)),
      Number(currentMonth.value.slice(5, 7)),
      0,
    ).getDate();
    const totalWeeks = Math.ceil(lastDayOfMonth / 7);

    return Array.from({ length: totalWeeks }, (_, index) => {
      const weekNumber = index + 1;

      return (
        weeksInMonth.get(weekNumber) ?? {
          label: `${weekNumber}주`,
          income: 0,
          expense: 0,
        }
      );
    });
  }

  function getMonthlyStats() {
    const monthFormatter = new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
    });
    const monthStats = new Map();
    const [currentYear, currentMonthNumber] = currentMonth.value
      .split('-')
      .map(Number);

    for (let offset = 3; offset >= 0; offset -= 1) {
      const date = new Date(currentYear, currentMonthNumber - 1 - offset, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      monthStats.set(monthKey, {
        label: `${monthFormatter.format(date)}월`,
        income: 0,
        expense: 0,
      });
    }

    transactions.value.forEach((transaction) => {
      const monthKey = transaction.date.slice(0, 7);

      if (!monthStats.has(monthKey)) {
        return;
      }

      const monthlyStat = monthStats.get(monthKey);

      if (transaction.type === 'income') {
        monthlyStat.income += transaction.amount;
      }

      if (transaction.type === 'expense') {
        monthlyStat.expense += transaction.amount;
      }
    });

    return Array.from(monthStats.values());
  }

  // 카테고리별 지출 내역 조회 함수
  // 사용 모듈: src/services/categoryService.js
  const getCategoryStats = async (userId, startDate, endDate) => {
    isLoading.value = true;
    try {
      const data = await fetchTransactionsByDateApi(userId, startDate, endDate);
      //가져온 데이터를 상태에 저장
      transactions.value = data;
    } catch (error) {
      console.error('거래 내역 로드 실패: ', error);
      alert('데이터를 가져오는 중 오류가 발생하였습니다.');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    transactions,
    isLoading,
    budgets,
    currentMonth,
    monthlyTransactions,
    monthlyIncome,
    monthlyExpense,
    totalBalance,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    getCategoryStats,
    getWeeklyStats,
    getMonthlyStats,
  };
});
