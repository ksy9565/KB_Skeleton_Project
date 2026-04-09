import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.your-domain.com',
  timeout: 5000,
});

export const fetchUserInfoApi = async (userId) => {
  // 실제 백엔드 엔드포인트에 맞춰 수정하세요
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
