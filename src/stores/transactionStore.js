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
  async function deleteTransaction(id) {
    try {
      await transactionService.deleteTransaction(id);

      const index = transactions.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        transactions.value = transactions.value.filter((t) => t.id !== id);
      }

      return true;
    } catch (error) {
      console.error('스토어 업데이트 실패:', error);
      throw error;
    }
  }

  const getRecentTransactions = computed((limit = 10) => {});

  function getWeeklyStats() {
    const weeklyStats = [];
    const now = new Date();

    // 1. 최근 5주를 역순으로 계산 (오늘 기준)
    for (let i = 4; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i * 7);

      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const date = targetDate.getDate();

      // 해당 주차 계산 (7일 단위)
      const weekNumber = Math.ceil(date / 7);
      const label = `${month}월 ${weekNumber}주`;

      // 2. 중요: 'allTransactions' 대신 스토어에 실제 정의된 변수명을 사용하세요.
      // 만약 변수명이 'transactions'라면 아래처럼 수정합니다.
      // 데이터가 없는 경우를 대비해 기본값 []를 둡니다.
      const sourceData = transactions.value || [];

      const filtered = sourceData.filter((t) => {
        const tDate = new Date(t.date);
        // 연, 월, 주차가 모두 일치하는지 확인
        return (
          tDate.getFullYear() === year &&
          tDate.getMonth() + 1 === month &&
          Math.ceil(tDate.getDate() / 7) === weekNumber
        );
      });

      const income = filtered
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = filtered
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

      weeklyStats.push({
        label,
        income,
        expense,
        date: dateString,
      });
    }

    return weeklyStats;
  }

  function getMonthlyStats() {
    const monthFormatter = new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
    });
    const monthStats = new Map();
    const [currentYear, currentMonthNumber] = currentMonth.value
      .split('-')
      .map(Number);

    for (let offset = 4; offset >= 0; offset -= 1) {
      const date = new Date(currentYear, currentMonthNumber - 1 - offset, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      monthStats.set(monthKey, {
        label: `${monthFormatter.format(date)}`,
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
      const userId = authStore.currentUser?.id;
      // 새 객체 생성
      const newTransaction = {
        ...formData,
        userId: formData.userId ?? userId ?? null,
        amount: Number(formData.amount),
      };

      // db.json에 POST 요청으로 저장
      const response = await axios.post(
        'http://localhost:3000/transactions',
        newTransaction,
      );
      const created = response.data;

      if (
        created?.userId === userId &&
        typeof created?.date === 'string' &&
        created.date.startsWith(currentMonth.value)
      ) {
        transactions.value.unshift(created);
      }

      return created;
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
    updateTransaction,
    addTransaction2,
  };
});
