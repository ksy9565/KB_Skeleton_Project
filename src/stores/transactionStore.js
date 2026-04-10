import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { transactionService } from '@/services/transactionService';
import { useAuthStore } from './authStore';
import axios from 'axios';

import { fetchTransactionsByDateApi } from '@/services/getCategoryService';

export const useTransactionStore = defineStore('transaction', () => {
  // State
  const authStore = useAuthStore();
  const transactions = ref([]);
  const budgets = ref([]);
  const currentBudget = ref(null);
  const currentMonth = ref(new Date().toISOString().slice(0, 7));

  const isLoading = ref(false);

  // Getters
  // 1. 월별 거래내역 필터링
  const monthlyTransactions = computed(() => {
    return transactions.value.filter((t) =>
      t.date.startsWith(currentMonth.value),
    );
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

  // 5. 예산 대비 지출 진행률
  const budgetProgress = computed(() => {
    const budgetAmount = Number(currentBudget.value?.amount || 0);
    const spentAmount = monthlyExpense.value;

    if (!budgetAmount || budgetAmount <= 0) {
      return {
        budgetAmount: 0,
        spentAmount,
        spentPercent: 0,
        remainingPercent: 100,
      };
    }

    const spentPercent = Math.round((spentAmount / budgetAmount) * 100);
    const remainingPercent = 100 - spentPercent;

    return {
      budgetAmount,
      spentAmount,
      spentPercent,
      remainingPercent,
    };
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

  async function fetchBudgetForCurrentMonth() {
    const userId = authStore.currentUser?.id;
    if (!userId) {
      currentBudget.value = null;
      return;
    }

    try {
      const data = await transactionService.getBudgetByUserIdAndMonth(
        userId,
        currentMonth.value,
      );

      currentBudget.value = data;
      if (data) {
        budgets.value = [
          ...budgets.value.filter(
            (budget) => budget.month !== currentMonth.value,
          ),
          data,
        ];
      }
    } catch (error) {
      console.error('예산 데이터 로드 실패:', error);
      currentBudget.value = null;
    }
  }

  async function saveBudgetForCurrentMonth(amount) {
    const userId = authStore.currentUser?.id;
    if (!userId) {
      throw new Error('로그인한 유저 정보가 없습니다.');
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw new Error('예산은 0보다 큰 숫자여야 합니다.');
    }

    const payload = {
      userId,
      month: currentMonth.value,
      amount: normalizedAmount,
    };

    if (currentBudget.value?.id) {
      const updated = await transactionService.updateBudget(
        currentBudget.value.id,
        payload,
      );
      currentBudget.value = updated;
      return updated;
    }

    const created = await transactionService.createBudget(payload);
    currentBudget.value = created;
    budgets.value.push(created);
    return created;
  }

  function addTransaction(transaction) {
    // 1. 거래 추가
    transactions.value.push({ ...transaction, id: Date.now() });

    // 2. (선택사항) Auth 스토어의 잔액(balance) 업데이트 로직 연결 가능
  }

  async function updateTransaction(id, data) {
    try {
      await transactionService.updateTransaction(id, data);

      const index = transactions.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        transactions.value[index] = { ...transactions.value[index], ...data };
        console.log('스토어 업데이트 완료:', transactions.value[index]);
      }
    } catch (error) {
      console.error('스토어 업데이트 실패:', error);
      throw error;
    }
  }
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
  const getCategoryStats = async (userId, yearMonth) => {
    isLoading.value = true;
    try {
      const data = await fetchTransactionsByDateApi(userId, yearMonth);
      //가져온 데이터를 상태에 저장
      transactions.value = data;
    } catch (error) {
      console.error('거래 내역 로드 실패: ', error);
    } finally {
      isLoading.value = false;
    }
  };

  const addTransaction2 = async (formData) => {
    try {
      // 새 객체 생성
      const newTransaction = {
        ...formData,
      };

      // db.json에 POST 요청으로 저장
      await axios.post('http://localhost:3000/transactions', newTransaction);
    } catch (error) {
      console.error('거래 내역 저장 실패:', error);
      throw error;
    }
  };

  return {
    transactions,
    isLoading,
    budgets,
    currentBudget,
    currentMonth,
    monthlyTransactions,
    monthlyIncome,
    monthlyExpense,
    totalBalance,
    budgetProgress,
    fetchTransactions,
    fetchBudgetForCurrentMonth,
    saveBudgetForCurrentMonth,
    addTransaction,
    deleteTransaction,
    getCategoryStats,
    getWeeklyStats,
    getMonthlyStats,
    addTransaction2,
  };
});
