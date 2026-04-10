import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchUserInfoApi, registerUserApi, loginUserApi, checkUsernameApi } from '@/services/userService';

export const useAuthStore = defineStore('auth', () => {
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

  const isAuthenticated = computed(() => !!currentUser.value);

  // Actions
  const login = async (username, password) => {
    isLoading.value = true;
    error.value = null;
    try {
      const user = await loginUserApi(username, password); 
      
      if (user) {
        currentUser.value = user;
        return true;
      } else {
        error.value = "아이디 또는 비밀번호가 일치하지 않습니다.";
        return false;
      }
    } catch (err) {
      error.value = "서버와 통신 중 오류가 발생했습니다.";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const isDuplicated = await checkUsernameApi(userData.username);
      if (isDuplicated) {
        error.value = "이미 사용 중인 아이디입니다.";
        return false;
      }

      const newUser = {
        ...userData,
        balance: 0,
        layoutId: 1
      };

      await registerUserApi(newUser);
      return true;
    } catch (err) {
      error.value = "회원가입에 실패했습니다.";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    currentUser.value = null;
    error.value = null;
  };

  function updateBalance(newAmount) {
    if (currentUser.value) currentUser.value.balance += newAmount;
  }

  const getUserInfo = async (userId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await fetchUserInfoApi(userId);
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
    register,
    logout,
    updateBalance,
  };
});
