<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
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
const authStore = useAuthStore();

const form = reactive({
  username: '',
  name: '',
  password: '',
});

const errorMessage = ref('');

const handleRegister = async () => {
  errorMessage.value = '';

  if (!form.username.trim() || !form.name.trim() || !form.password.trim()) {
    errorMessage.value = '아이디, 이름, 비밀번호를 모두 입력해 주세요.';
    return;
  }

  const isSuccess = await authStore.register({
    username: form.username.trim(),
    name: form.name.trim(),
    password: form.password,
  });

  if (isSuccess) {
    router.push({ name: 'login', query: { registered: '1' } });
  } else {
    errorMessage.value = authStore.error;
  }

  console.log('-----디버깅------');
  console.log('입력값:', form.username);
  console.log('가입 결과:', isSuccess);
  console.log('스토어 에러:', authStore.error);
};
</script>

<template>
  <main class="auth-page">
    <DashboardSidebar :groups="navigationGroups" />

    <div class="auth-content">
      <section class="auth-panel">
        <div class="auth-copy">
          <p class="eyebrow">Register</p>
          <h2>새 계정을 만들고 가계부를 시작해보세요</h2>
          <p class="description">
            아이디, 이름, 비밀번호를 입력하면 바로 로그인할 수 있는 계정이
            생성됩니다.
          </p>
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">
          <label class="field">
            <span>아이디</span>
            <input
              v-model="form.username"
              type="text"
              name="username"
              placeholder="사용할 아이디를 입력하세요"
              autocomplete="username"
            />
          </label>

          <label class="field">
            <span>이름</span>
            <input
              v-model="form.name"
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              autocomplete="name"
            />
          </label>

          <label class="field">
            <span>비밀번호</span>
            <input
              v-model="form.password"
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              autocomplete="new-password"
            />
          </label>

          <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>

          <button type="submit" class="submit-button">회원가입</button>
        </form>

        <p class="auth-link">
          이미 계정이 있나요?
          <RouterLink :to="{ name: 'login' }">로그인</RouterLink>
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
  width: min(100%, 460px);
  padding: 36px 32px;
  border: 1px solid rgba(124, 58, 237, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 50px rgba(95, 72, 155, 0.1);
}

.auth-copy h1 {
  margin: 10px 0 12px;
  font-size: clamp(2rem, 4vw, 2.6rem);
  line-height: 1.1;
  color: #1f2937;
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
