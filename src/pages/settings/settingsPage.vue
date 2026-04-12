<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardSidebar from '@/components/mainPage/DashboardSidebar.vue';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { checkUsernameTakenByOtherApi } from '@/services/userService';
import { transactionService } from '@/services/transactionService';

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
const transactionStore = useTransactionStore();

const profileForm = reactive({
  name: '',
  username: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const profileMessage = ref('');
const passwordMessage = ref('');
const resetMessage = ref('');
const profileError = ref('');
const passwordError = ref('');
const resetError = ref('');

const isSavingProfile = ref(false);
const isSavingPassword = ref(false);
const isResettingLedger = ref(false);
const isResettingProfileImage = ref(false);

const selectedProfileImage = ref(null);

const profilePreviewSrc = computed(
  () =>
    selectedProfileImage.value || authStore.currentUser?.profileImage || null,
);

const syncFormFromUser = () => {
  profileForm.name = authStore.currentUser?.name || '';
  profileForm.username = authStore.currentUser?.username || '';
};

watch(
  () => authStore.currentUser,
  () => {
    syncFormFromUser();
  },
  { immediate: true },
);

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsDataURL(file);
  });

const createCenterCroppedProfileImage = async (file) => {
  const src = await readImageFile(file);
  const image = new Image();
  image.src = src;

  await new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
  });

  const side = Math.min(image.width, image.height);
  const offsetX = (image.width - side) / 2;
  const offsetY = (image.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, offsetX, offsetY, side, side, 0, 0, 800, 800);

  return canvas.toDataURL('image/jpeg', 0.92);
};

const handleProfileImageChange = async (event) => {
  profileError.value = '';

  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    profileError.value = '이미지 파일만 업로드할 수 있습니다.';
    return;
  }

  try {
    selectedProfileImage.value = await createCenterCroppedProfileImage(file);
  } catch (error) {
    profileError.value = '이미지 처리 중 오류가 발생했습니다.';
  }
};

const resetProfileImage = async () => {
  profileError.value = '';
  profileMessage.value = '';

  if (!authStore.currentUser?.id) {
    profileError.value = '로그인한 사용자 정보가 없습니다.';
    return;
  }

  const confirmed = window.confirm(
    '프로필 사진을 기본 아이콘으로 초기화할까요?',
  );
  if (!confirmed) {
    return;
  }

  isResettingProfileImage.value = true;
  try {
    const isSuccess = await authStore.updateCurrentUser({ profileImage: null });
    if (!isSuccess) {
      profileError.value =
        authStore.error || '프로필 사진 초기화에 실패했습니다.';
      return;
    }

    selectedProfileImage.value = null;
    profileMessage.value = '프로필 사진이 기본 아이콘으로 초기화되었습니다.';
  } finally {
    isResettingProfileImage.value = false;
  }
};

const saveProfile = async () => {
  profileError.value = '';
  profileMessage.value = '';

  const user = authStore.currentUser;
  if (!user?.id) {
    profileError.value = '로그인한 사용자 정보가 없습니다.';
    return;
  }

  const trimmedName = profileForm.name.trim();
  const trimmedUsername = profileForm.username.trim();

  if (!trimmedName || !trimmedUsername) {
    profileError.value = '이름과 아이디를 모두 입력해 주세요.';
    return;
  }

  isSavingProfile.value = true;
  try {
    if (trimmedUsername !== user.username) {
      const isTaken = await checkUsernameTakenByOtherApi(
        trimmedUsername,
        user.id,
      );
      if (isTaken) {
        profileError.value = '이미 사용 중인 아이디입니다.';
        return;
      }
    }

    const payload = {
      name: trimmedName,
      username: trimmedUsername,
    };

    if (selectedProfileImage.value) {
      payload.profileImage = selectedProfileImage.value;
    }

    const isSuccess = await authStore.updateCurrentUser(payload);
    if (!isSuccess) {
      profileError.value = authStore.error || '회원 정보 저장에 실패했습니다.';
      return;
    }

    profileMessage.value = '회원 정보가 저장되었습니다.';
    selectedProfileImage.value = null;
  } finally {
    isSavingProfile.value = false;
  }
};

const changePassword = async () => {
  passwordError.value = '';
  passwordMessage.value = '';

  const user = authStore.currentUser;
  if (!user?.id) {
    passwordError.value = '로그인한 사용자 정보가 없습니다.';
    return;
  }

  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    passwordError.value = '현재 비밀번호와 새 비밀번호를 입력해 주세요.';
    return;
  }

  if (passwordForm.currentPassword !== user.password) {
    passwordError.value = '현재 비밀번호가 일치하지 않습니다.';
    return;
  }

  if (passwordForm.newPassword.length < 4) {
    passwordError.value = '새 비밀번호는 4자 이상 입력해 주세요.';
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '새 비밀번호 확인이 일치하지 않습니다.';
    return;
  }

  isSavingPassword.value = true;
  try {
    const isSuccess = await authStore.updateCurrentUser({
      password: passwordForm.newPassword,
    });

    if (!isSuccess) {
      passwordError.value = authStore.error || '비밀번호 변경에 실패했습니다.';
      return;
    }

    passwordMessage.value = '비밀번호가 변경되었습니다.';
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } finally {
    isSavingPassword.value = false;
  }
};

const resetLedger = async () => {
  resetError.value = '';
  resetMessage.value = '';

  const user = authStore.currentUser;
  if (!user?.id) {
    resetError.value = '로그인한 사용자 정보가 없습니다.';
    return;
  }

  const confirmed = window.confirm(
    '가계부 내역(거래 내역/예산)을 초기화할까요? 이 작업은 되돌릴 수 없습니다.',
  );

  if (!confirmed) {
    return;
  }

  isResettingLedger.value = true;
  try {
    const result = await transactionService.resetUserLedger(user.id);
    await Promise.all([
      transactionStore.fetchTransactions(),
      transactionStore.fetchBudgetForCurrentMonth(),
    ]);

    resetMessage.value = `초기화 완료: 거래 ${result.deletedTransactions}건, 예산 ${result.deletedBudgets}건`;
  } catch (error) {
    resetError.value = '가계부 초기화 중 오류가 발생했습니다.';
  } finally {
    isResettingLedger.value = false;
  }
};

const moveToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<template>
  <main class="settings-page">
    <div class="dashboard-shell">
      <DashboardSidebar :groups="navigationGroups" :show-battery="true" />

      <section class="content-area settings-content">
        <header class="settings-header">
          <p class="eyebrow">Settings</p>
          <h1>계정 및 가계부 설정</h1>
        </header>

        <section v-if="!authStore.isAuthenticated" class="settings-card">
          <p class="help-text">설정 기능은 로그인 후 사용할 수 있습니다.</p>
          <button type="button" class="primary-btn" @click="moveToLogin">
            로그인 하러가기
          </button>
        </section>

        <template v-else>
          <section class="settings-card">
            <h2>회원 정보 수정</h2>

            <div class="profile-row">
              <div class="avatar-wrap">
                <img
                  v-if="profilePreviewSrc"
                  :src="profilePreviewSrc"
                  alt="프로필 미리보기"
                  class="avatar-image"
                />
                <div v-else class="avatar-fallback">
                  <i class="fa-solid fa-user"></i>
                </div>
              </div>

              <div class="profile-image-controls">
                <div class="photo-actions">
                  <label class="file-btn" for="profile-image-input"
                    >프로필 사진 선택</label
                  >
                  <button
                    type="button"
                    class="secondary-btn"
                    :disabled="isResettingProfileImage"
                    @click="resetProfileImage"
                  >
                    {{
                      isResettingProfileImage
                        ? '초기화 중...'
                        : '프로필 사진 초기화'
                    }}
                  </button>
                </div>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  @change="handleProfileImageChange"
                />
                <p class="help-text">권장: 800x800</p>
              </div>
            </div>

            <div class="field-grid">
              <label class="field">
                <span>이름</span>
                <input
                  v-model="profileForm.name"
                  type="text"
                  placeholder="이름"
                />
              </label>

              <label class="field">
                <span>아이디</span>
                <input
                  v-model="profileForm.username"
                  type="text"
                  placeholder="아이디"
                />
              </label>
            </div>

            <p v-if="profileError" class="message error">{{ profileError }}</p>
            <p v-if="profileMessage" class="message success">
              {{ profileMessage }}
            </p>

            <button
              type="button"
              class="primary-btn"
              :disabled="isSavingProfile"
              @click="saveProfile"
            >
              {{ isSavingProfile ? '저장 중...' : '회원 정보 저장' }}
            </button>
          </section>

          <section class="settings-card">
            <h2>비밀번호 변경</h2>

            <div class="field-grid">
              <label class="field">
                <span>현재 비밀번호</span>
                <input v-model="passwordForm.currentPassword" type="password" />
              </label>

              <label class="field">
                <span>새 비밀번호</span>
                <input v-model="passwordForm.newPassword" type="password" />
              </label>

              <label class="field">
                <span>새 비밀번호 확인</span>
                <input v-model="passwordForm.confirmPassword" type="password" />
              </label>
            </div>

            <p v-if="passwordError" class="message error">
              {{ passwordError }}
            </p>
            <p v-if="passwordMessage" class="message success">
              {{ passwordMessage }}
            </p>

            <button
              type="button"
              class="primary-btn"
              :disabled="isSavingPassword"
              @click="changePassword"
            >
              {{ isSavingPassword ? '변경 중...' : '비밀번호 변경' }}
            </button>
          </section>

          <section class="settings-card danger-zone">
            <h2>가계부 초기화</h2>
            <p class="help-text">
              현재 계정의 거래 내역과 예산 데이터가 모두 삭제됩니다.
            </p>

            <p v-if="resetError" class="message error">{{ resetError }}</p>
            <p v-if="resetMessage" class="message success">
              {{ resetMessage }}
            </p>

            <button
              type="button"
              class="danger-btn"
              :disabled="isResettingLedger"
              @click="resetLedger"
            >
              {{ isResettingLedger ? '초기화 중...' : '가계부 내용 초기화' }}
            </button>
          </section>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  position: relative;
  padding: 24px;
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.08),
    rgba(255, 255, 255, 0.96) 30%
  );
}

.settings-content {
  width: min(100%, 920px);
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.settings-header {
  padding: 8px 4px;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #7c3aed;
  text-transform: uppercase;
}

.settings-header h1 {
  margin: 8px 0 0;
  color: #0f172a;
  font-size: clamp(1.4rem, 2.8vw, 2rem);
}

.settings-card {
  border: 1px solid #ddd6fe;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  padding: 18px;
}

.settings-card h2 {
  margin: 0 0 14px;
  color: #0f172a;
  font-size: 1.1rem;
}

.profile-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.avatar-wrap {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #c4b5fd;
  background: #f3e8ff;
  display: grid;
  place-items: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 2rem;
  color: #6d28d9;
}

.profile-image-controls {
  flex: 1;
  min-width: 220px;
}

.profile-image-controls input[type='file'] {
  display: none;
}

.file-btn {
  display: inline-block;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.photo-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-btn {
  border: 1px solid #c4b5fd;
  border-radius: 12px;
  background: #f5f3ff;
  color: #5b21b6;
  padding: 10px 14px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.secondary-btn:disabled {
  opacity: 0.72;
  cursor: wait;
}

.field-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.field {
  display: grid;
  gap: 7px;
}

.field span {
  color: #334155;
  font-weight: 700;
  font-size: 0.9rem;
}

.field input {
  border: 1px solid #ddd6fe;
  border-radius: 12px;
  padding: 11px 12px;
  font: inherit;
}

.field input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}

.message {
  margin: 12px 0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.92rem;
}

.success {
  background: #dcfce7;
  color: #166534;
}

.error {
  background: #fee2e2;
  color: #b91c1c;
}

.help-text {
  margin: 6px 0 0;
  color: #475569;
  line-height: 1.5;
}

.primary-btn,
.danger-btn {
  border: 0;
  border-radius: 12px;
  padding: 11px 14px;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  margin-top: 10px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.danger-btn {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

.primary-btn:disabled,
.danger-btn:disabled {
  opacity: 0.72;
  cursor: wait;
}

.danger-zone {
  border-color: #fecaca;
}
</style>
