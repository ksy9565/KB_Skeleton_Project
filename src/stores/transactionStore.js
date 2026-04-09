import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { transactionService } from '@/services/transactionService';


export const useTransactionStore = defineStore('transaction', () => {
  // State
  const transactions = ref([]);
  const budgets = ref([]);
  const currentMonth = ref(new Date().toISOString().slice(0, 7));

  // Getters
  // 1. 월별 거래내역 필터링
  const monthlyTransactions = computed(() => {
    return transactions.value.filter(t => t.date.startsWith(currentMonth.value));
  });

  // 2. 이번 달 총 수입
  const monthlyIncome = computed(() => 
    monthlyTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  // 3. 이번 달 총 지출
  const monthlyExpense = computed(() =>
    monthlyTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  // 4. 총 자산
  const totalBalance = computed(() => {
    return transactions.value.reduce((acc, cur) => {
      return cur.type === 'income' ? acc + cur.amount : acc - cur.amount;
    }, 0);
  });

  // Actions
  // 1. 거래 가져오기
  async function fetchTransactions(){
    try {
      const data = await transactionService.getTransactions();
      transactions.value = data;
      console.log("데이터 로드 성공: ", data);
    } catch (error) {
      console.error("데이터 로드 실패: ", error);
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

  function getWeeklyStats() {}

  function getCategoryStats() {}

  return {
    transactions,
    budgets,
    currentMonth,
    monthlyTransactions,
    monthlyIncome,
    monthlyExpense,
    totalBalance,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
  };
});
