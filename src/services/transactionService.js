import axios from 'axios';

const BASE_URL = 'http://localhost:3000/transactions';

export const transactionService = {
  // 특정 유저의 전체 거래 내역 가져오기
  // GET /transactions?userId={userId}
async getTransactionsByUserId(userId) {
    if (!userId) throw new Error('userId가 필요합니다.');

    const res = await axios.get(BASE_URL, {
        params: { userId }
    });
    return res.data;
}
};