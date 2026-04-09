import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // 실제 API 서버 주소
});

/**
 * 특정 사용자의 기간별 거래 내역 조회
 * @param {number} userId - 사용자 ID
 * @param {string} startDate - 시작일 (YYYY-MM-DD)
 * @param {string} endDate - 종료일 (YYYY-MM-DD)
 */
export const fetchTransactionsByDateApi = async (
  userId,
  startDate,
  endDate,
) => {
  const response = await api.get('/transactions', {
    params: {
      userId: userId,
      date_gte: startDate,
      date_lte: endDate,
    },
  });
  return response.data;
};
