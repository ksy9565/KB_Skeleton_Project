import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// 유저 정보 가져오기
export const fetchUserInfoApi = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
