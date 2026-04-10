<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';

const router = useRouter();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

const isModalOpen = ref(false);
const budgetInput = ref('');

const progress = computed(() => transactionStore.budgetProgress);
const batteryFillPercent = computed(() =>
  Math.max(0, Math.min(100, progress.value.remainingPercent)),
);
const currentMonthLabel = computed(
  () => transactionStore.currentMonth.replace('-', '년 ') + '월',
);
const hasBudget = computed(() => progress.value.budgetAmount > 0);

const openBudgetModal = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' });
    return;
  }

  budgetInput.value =
    progress.value.budgetAmount > 0 ? String(progress.value.budgetAmount) : '';
  isModalOpen.value = true;
};

const closeBudgetModal = () => {
  isModalOpen.value = false;
};

const submitBudget = async () => {
  const parsed = Number(budgetInput.value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    window.alert('예산은 0보다 큰 숫자로 입력해주세요.');
    return;
  }

  try {
    await transactionStore.saveBudgetForCurrentMonth(parsed);
    closeBudgetModal();
  } catch (error) {
    console.error(error);
    window.alert('예산 저장 중 오류가 발생했습니다.');
  }
};
</script>

<template>
  <section class="budget-battery">
    <button
      type="button"
      class="budget-battery-button"
      :class="{ 'is-empty': !hasBudget }"
      @click="openBudgetModal"
    >
      <div class="budget-battery-content" :class="{ 'is-blurred': !hasBudget }">
        <div
          class="budget-battery-icon"
          :style="{ '--battery-level': `${batteryFillPercent}%` }"
        >
          <div class="budget-battery-head"></div>
          <div class="budget-battery-body">
            <div class="budget-battery-fill"></div>
            <div class="budget-battery-line"></div>
            <div class="budget-battery-line"></div>
          </div>
        </div>

        <div class="budget-battery-meta">
          <p>예산 배터리</p>
          <strong>{{
            hasBudget ? `${progress.remainingPercent}%` : '--'
          }}</strong>
          <span
            >{{ currentMonthLabel }} ·
            {{ progress.spentAmount.toLocaleString() }}원 사용</span
          >
        </div>
      </div>

      <span v-if="!hasBudget" class="budget-battery-empty"
        >예산을 입력해주세요</span
      >
    </button>

    <div v-if="isModalOpen" class="budget-modal" @click.self="closeBudgetModal">
      <div class="budget-modal-card">
        <h3>예산 설정</h3>
        <p>{{ currentMonthLabel }} 예산을 입력하세요.</p>

        <input
          v-model="budgetInput"
          type="number"
          min="1"
          step="1000"
          placeholder="예: 2000000"
        />

        <div class="budget-modal-actions">
          <button type="button" class="ghost" @click="closeBudgetModal">
            취소
          </button>
          <button type="button" class="primary" @click="submitBudget">
            저장
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
