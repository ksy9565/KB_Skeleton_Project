import axios from 'axios';

const BASE_URL = 'http://localhost:3000/transactions';

export const transactionService = {
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
};
