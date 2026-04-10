<script setup>
// 1. 모듈 임포트
import { computed, onMounted, ref } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import addTransactionModal from '@/pages/subPage/addTransactionModal.vue';
import { useBaseStore } from '@/stores/commonStore';
const modalOpen = ref(false);
// 2. ChartJS 플러그인 등록
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// 3. 스토어 설정
const transactionStore = useTransactionStore();
const authStore = useAuthStore();
const userId = computed(() => authStore.currentUser?.id || 'guest');
const baseStore = useBaseStore();

const { categories, paymentMethods } = storeToRefs(baseStore);
const { transactions, currentMonth } = storeToRefs(transactionStore);
const { addTransaction2 } = transactionStore;

const handleSave = async (data) => {
  await addTransaction2(data);
  const currentUserId = authStore.currentUser?.id;
  if (currentUserId) {
    await transactionStore.getCategoryStats(currentUserId, currentMonth.value);
  }
  modalOpen.value = false;
};
// 초기 데이터 로드
onMounted(async () => {
  const userId = authStore.currentUser?.id || 1;
  // 임시로 최근 1개월 데이터를 가져온 후 위에서 slice(0, 10) 처리
  await transactionStore.getCategoryStats(userId, currentMonth.value);
});

// 템플릿에서 사용할 items 가공 (최근 10개)
const items = computed(() => {
  return (
    [...transactions.value]
      // 1. 날짜 기준 최신순 정렬
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      // 2. 상위 10개만 추출
      .slice(0, 10)
      // 3. 템플릿 변수명에 맞게 매핑
      .map((t) => ({
        title: t.memo || '내역 없음',
        date: t.date, // YYYY-MM-DD 형식이라고 가정
        // 스토어의 영문 type을 템플릿의 한글 조건(수입/지출)과 일치시킴
        method: t.paymentMethod,
        type: t.type === 'income' ? '수입' : '지출',
        // 금액 포맷팅 (예: 1,000원)
        amount: `${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}원`,
      }))
  );
});
</script>

<template>
  <article class="panel recent-panel">
    <div class="panel-head">
      <p class="panel-label">최근 거래 내역</p>
      <button type="button" @click="modalOpen = true" class="btn-add">
        상세
      </button>
    </div>

    <ul class="transaction-list">
      <div v-if="items.length > 0">
        <li
          v-for="item in items"
          :key="`${item.title}-${item.date}`"
          class="transaction-item"
        >
          <div class="transaction-meta">
            <span
              :class="[
                'transaction-badge',
                item.type === '수입' ? 'positive' : 'negative',
              ]"
            >
              {{ item.type }}
            </span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.method }}</p>
              <p>{{ item.date }}</p>
            </div>
          </div>
          <strong
            class="transaction-amount"
            :class="item.type === '수입' ? 'positive' : 'negative'"
          >
            {{ item.amount }}
          </strong>
        </li>
      </div>
      <li v-else class="transaction-item no-data">내역이 존재하지 않습니다.</li>
    </ul>
    <addTransactionModal
      :is-open="modalOpen"
      :userId="userId"
      :categories="categories"
      :paymentMethods="paymentMethods"
      @close="modalOpen = false"
      @save="handleSave"
      ;
    />
  </article>
</template>
