import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTransactionStore = defineStore('transaction', () => {
  // State
  const transactions = ref([]);
  const budgets = ref([]);

  // Getters
  const monthlyTransactions = computed(() => {
    // 월별 필터링 로직 등을 여기에 구현
    return transactions.value;
  });

  const totalExpense = computed(() =>
    transactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  // Actions
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

  function getWeeklyStats() {}

  function getCategoryStats() {}

  return {
    transactions,
    budgets,
    totalExpense,
    addTransaction,
    deleteTransaction,
  };
});
