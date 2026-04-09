import axios from 'axios';

const BASE_URL = 'http://localhost:3000/transactions';

export const transactionService = {
  // 전체 거래 내역 가져오기
  async getTransactions() {
    const res = await axios.get(BASE_URL);
    return res.data;
  },
};