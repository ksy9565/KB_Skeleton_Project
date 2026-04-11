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
export const fetchTransactionsByDateApi = async (userId, yearMonth) => {
  // yearMonth: '2026-04' -> startDate: '2026-04-01', endDate: '2026-04-30'
  const [year, month] = yearMonth.split('-');
  const startDate = `${year}-${month}-01`;

  // 해당 월의 마지막 날 계산
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

  const response = await api.get('/transactions', {
    params: {
      userId: userId,
      date_gte: startDate,
      date_lte: endDate,
    },
  });
  return response.data;
};
