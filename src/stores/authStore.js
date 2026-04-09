import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchUserInfoApi } from '@/services/userService';

export const useAuthStore = defineStore('auth', () => {
  // State: 사용자 정보 저장 변수
  const currentUser = ref(null); // 현재 로그인한 사용자 객체
  const isLoading = ref(false);
  const error = ref(null);

  const layouts = ref([
    { id: 1, shape: 'normal' },
    { id: 2, shape: 'minimal' },
    { id: 3, shape: 'goal' },
    { id: 4, shape: 'analysis' },
  ]);

  // Getters
  const userLayout = computed(() => {
    if (!currentUser.value) return layouts.value[0];
    return layouts.value.find((l) => l.id === currentUser.value.layoutId);
  });

  // Actions
  function login(userData) {
    currentUser.value = userData;
  }

  function logout(userData) {
    currentUser.value = userData;
  }

  function updateBalance(newAmount) {
    if (currentUser.value) currentUser.value.balance += newAmount;
  }

  // 비동기 통신 및 상태 업데이트
  // 2. Actions: 비동기 통신 및 상태 업데이트
  const getUserInfo = async (userId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await fetchUserInfoApi(userId);
      // API 응답 데이터를 state에 저장
      login(data);
    } catch (err) {
      console.error('사용자 정보 로딩 실패:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    currentUser,
    isLoading,
    error,
    layouts,
    userLayout,
    getUserInfo,
    login,
    logout,
    updateBalance,
  };
});
