<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import DashboardSidebar from '@/components/mainPage/DashboardSidebar.vue';

const navigationGroups = [
  {
    title: '계정',
    items: ['대시보드', '가계부', '통계', '카드 관리'],
  },
  {
    title: '설정',
    items: ['예산 설정', '카테고리 설정', '알림 설정'],
  },
];

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
});

const errorMessage = ref('');
const successMessage = computed(() =>
  route.query.registered === '1'
    ? '회원가입이 완료되었습니다. 등록한 아이디와 비밀번호로 로그인해 주세요.'
    : '',
);

const handleLogin = async () => {
  errorMessage.value = '';

  if (!form.username.trim() || !form.password.trim()) {
    errorMessage.value = '아이디와 비밀번호를 모두 입력해 주세요.';
    return;
  }

  const isSuccess = await authStore.login(form.username.trim(), form.password);

  if (isSuccess) {
    router.push({ name: 'main' });
  } else {
    errorMessage.value = authStore.error || '로그인에 실패했습니다.';
  }
};
</script>

<template>
  <main class="auth-page">
    <DashboardSidebar :groups="navigationGroups" />

    <div class="auth-content">
      <section class="auth-panel">
        <div class="auth-copy">
          <p class="eyebrow">Login</p>
          <h2>가계부를 다시 작성해보세요</h2>
          <p class="description">
            등록한 아이디와 비밀번호를 입력하면 대시보드로 이동할 수 있습니다.
          </p>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <label class="field">
            <span>아이디</span>
            <input
              v-model="form.username"
              type="text"
              name="username"
              placeholder="아이디를 입력하세요"
              autocomplete="username"
              :disabled="authStore.isLoading"
            />
          </label>

          <label class="field">
            <span>비밀번호</span>
            <input
              v-model="form.password"
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              autocomplete="current-password"
              :disabled="authStore.isLoading"
            />
          </label>

          <p v-if="successMessage" class="message success">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>

          <button
            type="submit"
            class="submit-button"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading">로그인 중...</span>
            <span v-else>로그인</span>
          </button>
        </form>

        <p class="auth-link">
          아직 계정이 없나요?
          <RouterLink :to="{ name: 'register' }">회원가입</RouterLink>
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  position: relative;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(124, 58, 237, 0.18), transparent 34%),
    linear-gradient(180deg, #fcfaff 0%, #f5efff 100%);
}

.auth-content {
  min-height: calc(100vh - 48px);
  display: grid;
  place-items: center;
}

.auth-panel {
  width: min(100%, 440px);
  padding: 36px 32px;
  border: 1px solid rgba(124, 58, 237, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 24px 50px rgba(95, 72, 155, 0.1);
}

.auth-copy h1 {
  margin: 10px 0 12px;
  font-size: clamp(2rem, 4vw, 2.6rem);
  line-height: 1.1;
  color: #172033;
}

.eyebrow {
  margin: 0;
  color: #7c3aed;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.description {
  margin: 0;
  color: #5b6475;
  line-height: 1.6;
}

.auth-form {
  margin-top: 28px;
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
}

.field input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd6fe;
  border-radius: 14px;
  font: inherit;
  color: #0f172a;
  background: #fff;
  box-sizing: border-box;
}

.field input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15);
}

.message {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 0.92rem;
}

.message.success {
  color: #166534;
  background: #dcfce7;
}

.message.error {
  color: #b91c1c;
  background: #fee2e2;
}

.submit-button {
  border: 0;
  border-radius: 16px;
  padding: 15px 18px;
  font: inherit;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  cursor: pointer;
}

.auth-link {
  margin: 20px 0 0;
  color: #5b6475;
  text-align: center;
}

.auth-link a {
  color: #7c3aed;
  font-weight: 700;
  text-decoration: none;
}
</style>
