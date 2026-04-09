import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchTransactionsByDateApi } from '@/services/getCategoryService';

export const useTransactionStore = defineStore('transaction', () => {
  // State
  const transactions = ref([]);
  const budgets = ref([]);
  const isLoading = ref(false);
  const categories = ref([
    {
      id: 1,
      name: '급여',
      color: '',
    },

    {
      id: 2,
      name: '상여',
    },

    {
      id: 3,
      name: '용돈',
    },

    {
      id: 4,
      name: '부동산',
    },

    {
      id: 5,
      name: '금융',
    },

    {
      id: 6,
      name: '기타',
    },

    {
      id: 7,
      name: '식비',
    },

    {
      id: 8,
      name: '패션/쇼핑',
    },

    {
      id: 9,
      name: '뷰티/미용',
    },

    {
      id: 10,
      name: '교통',
    },

    {
      id: 11,
      name: '주거/통신',
    },

    {
      id: 12,
      name: '의료/건강',
    },

    {
      id: 13,
      name: '문화/여행',
    },

    {
      id: 14,
      name: '경조/선물',
    },

    {
      id: 15,
      name: '반려동물',
    },

    {
      id: 16,
      name: '기타',
    },
  ]);

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
    totalExpense,
    categories,
    addTransaction,
    deleteTransaction,
    getCategoryStats,
  };
});
