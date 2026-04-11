import axios from 'axios';

const BASE_URL = 'http://localhost:3000/transactions';
const BUDGET_BASE_URL = 'http://localhost:3000/budgets';

export const transactionService = {
  // 특정 유저의 전체 거래 내역 가져오기
  // GET /transactions?userId={userId}

  async getTransactionsByUserId(userId) {
    if (!userId) throw new Error('userId가 필요합니다.');

    const res = await axios.get(BASE_URL, {
      params: { userId },
    });
    return res.data;
  },
  async updateTransaction(id, data) {
    try {
      const response = await axios.patch(
        `http://localhost:3000/transactions/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('API 수정 요청 실패:', error);
      throw error;
    }
  },

  async getBudgetByUserIdAndMonth(userId, month) {
    if (!userId || !month) {
      throw new Error('userId와 month가 필요합니다.');
    }

    const fallbackNumericId = /^user\d+$/.test(String(userId))
      ? Number(String(userId).replace('user', ''))
      : null;

    const res = await axios.get(BUDGET_BASE_URL, {
      params: { month },
    });

    return (
      res.data.find(
        (budget) =>
          budget.userId === userId || budget.userId === fallbackNumericId,
      ) || null
    );
  },

  async createBudget(data) {
    const res = await axios.post(BUDGET_BASE_URL, data);
    return res.data;
  },

  async updateBudget(id, data) {
    const res = await axios.patch(`${BUDGET_BASE_URL}/${id}`, data);
    return res.data;
  },
};
