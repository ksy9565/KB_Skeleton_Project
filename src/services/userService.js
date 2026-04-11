import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// 유저 정보 가져오기
export const fetchUserInfoApi = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// 회원가입
export const registerUserApi = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// 로그인
// 전체 회원 조회 + 쿼리로 username만 필터링
export const loginUserApi = async (username, password) => {
  const response = await api.get('/users', { params: { username } });
  const user = response.data[0];

  if (user && user.password === password) {
    return user;
  }
  return null;
};

// 아이디 중복 검사
export const checkUsernameApi = async (username) => {
  const response = await api.get('/users', { params: { username } });
  return response.data.length > 0;
};

// 아이디 중복 검사 (본인 계정 제외)
export const checkUsernameTakenByOtherApi = async (username, userId) => {
  const response = await api.get('/users', { params: { username } });
  return response.data.some((user) => user.id !== userId);
};

// 회원 정보 수정
export const updateUserApi = async (userId, payload) => {
  const response = await api.patch(`/users/${userId}`, payload);
  return response.data;
};
