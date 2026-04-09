<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const STORAGE_KEY = 'kb-users';

const form = reactive({
  userId: '',
  password: '',
});

const errorMessage = ref('');
const successMessage = computed(() =>
  route.query.registered === '1'
    ? '회원가입이 완료되었습니다. 등록한 아이디와 비밀번호로 로그인해 주세요.'
    : '',
);

const handleLogin = () => {
  errorMessage.value = '';

  if (!form.userId.trim() || !form.password.trim()) {
    errorMessage.value = '아이디와 비밀번호를 모두 입력해 주세요.';
    return;
  }

  const users = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  const matchedUser = users.find(
    (user) =>
      user.userId === form.userId.trim() && user.password === form.password,
  );

  if (!matchedUser) {
    errorMessage.value = '아이디 또는 비밀번호가 올바르지 않습니다.';
    return;
  }

  const loggedInUser = {
    userId: matchedUser.userId,
    name: matchedUser.name,
    layoutId: matchedUser.layoutId ?? 1,
  };

  authStore.login(loggedInUser);
  localStorage.setItem('kb-current-user', JSON.stringify(loggedInUser));
  router.push({ name: 'main' });
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel">
      <div class="auth-copy">
        <p class="eyebrow">Login</p>
        <h2>가계부 서비스를 다시 시작해보세요</h2>
        <p class="description">
          등록한 아이디와 비밀번호를 입력하면 대시보드로 바로 이동할 수
          있습니다.
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label class="field">
          <span>아이디</span>
          <input
            v-model="form.userId"
            type="text"
            name="userId"
            placeholder="아이디를 입력하세요"
            autocomplete="username"
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
          />
        </label>

        <p v-if="successMessage" class="message success">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>

        <button type="submit" class="submit-button">로그인</button>
      </form>

      <p class="auth-link">
        아직 계정이 없나요?
        <RouterLink :to="{ name: 'register' }">회원가입</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(124, 58, 237, 0.18), transparent 34%),
    linear-gradient(180deg, #fcfaff 0%, #f5efff 100%);
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
