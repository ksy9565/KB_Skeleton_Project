import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  fetchUserInfoApi,
  registerUserApi,
  loginUserApi,
  checkUsernameApi,
  updateUserApi,
} from '@/services/userService';

export const useAuthStore = defineStore('auth', () => {
  const readSavedUser = () => {
    if (typeof localStorage === 'undefined') return null;

    const savedUser = localStorage.getItem('authUser');
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch (err) {
      console.error('localStorage 복구 실패:', err);
      localStorage.removeItem('authUser');
      return null;
    }
  };

  const currentUser = ref(readSavedUser()); // 현재 로그인한 사용자 객체
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

  const initializeAuth = () => {
    currentUser.value = readSavedUser();
  };

  // Actions
  const login = async (username, password) => {
    isLoading.value = true;
    error.value = null;
    try {
      const user = await loginUserApi(username, password);

      if (user) {
        currentUser.value = user;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('authUser', JSON.stringify(user));
        }
        return true;
      } else {
        error.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
        return false;
      }
    } catch (err) {
      error.value = '서버와 통신 중 오류가 발생했습니다.';
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
        error.value = '이미 사용 중인 아이디입니다.';
        return false;
      }

      const newUser = {
        ...userData,
        balance: 0,
        layoutId: 1,
        profileImage: null,
      };

      await registerUserApi(newUser);
      return true;
    } catch (err) {
      error.value = '회원가입에 실패했습니다.';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    currentUser.value = null;
    error.value = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authUser');
    }
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

  const updateCurrentUser = async (payload) => {
    if (!currentUser.value?.id) {
      error.value = '로그인한 사용자 정보가 없습니다.';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const updated = await updateUserApi(currentUser.value.id, payload);
      currentUser.value = {
        ...currentUser.value,
        ...updated,
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authUser', JSON.stringify(currentUser.value));
      }

      return true;
    } catch (err) {
      error.value = '회원 정보 저장에 실패했습니다.';
      return false;
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
    isAuthenticated,
    initializeAuth,
    getUserInfo,
    login,
    register,
    updateCurrentUser,
    logout,
    updateBalance,
  };
});
