<script setup>
import { computed, ref } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBaseStore } from '@/stores/commonStore';

const transactionStore = useTransactionStore();
const baseStore = useBaseStore();

const MAX_DISPLAY_COUNT = 5; // 화면에 보여줄 최대 항목 수
const isModalOpen = ref(false); // 모달 상태

// 1. 고정 지출 항목 필터링
const fixedExpenses = computed(() => {
  return transactionStore.transactions.filter(tx => tx.isFixed === true);
});

// 2. 고정 지출 총 합계 계산
const totalFixedAmount = computed(() => {
  return fixedExpenses.value.reduce((acc, curr) => acc + curr.amount, 0);
});

// 3. 날짜에서 "일"만 추출 (예: "2026-04-02" -> "2일")
const getDayOnly = (dateString) => {
  if (!dateString) return '';
  const day = new Date(dateString).getDate();
  return `${day}일`;
};

// 4. 화면에 표시할 만큼만 자른 데이터
const displayExpenses = computed(() => {
  return fixedExpenses.value.slice(0, MAX_DISPLAY_COUNT);
});

console.log('고정지출데이터 로드')
console.log(fixedExpenses.value);

</script>

<template>
  <article class="panel fixed-expense-panel">
    <div class="panel-head">
      <p class="panel-label">고정 지출</p>
      <button 
        v-if="fixedExpenses.length > MAX_DISPLAY_COUNT" 
        class="more-btn" 
        @click="isModalOpen = true"
      >
        자세히 보기
      </button>
    </div>

    <div class="fixed-expense-list">
      <div v-for="item in displayExpenses" :key="item.id" class="fixed-expense-row">
        <div class="row-left">
          <span class="day-text">{{ getDayOnly(item.date) }}</span>
          <div class="info-group">
            <span class="memo">{{ item.memo }}</span>
            <span class="category">{{ baseStore.getCategoryName(item.categoryId) || '기타' }}</span>
          </div>
        </div>
        <div class="row-right">
          <strong class="amount">{{ item.amount.toLocaleString() }}원</strong>
        </div>
      </div>

      <div v-if="fixedExpenses.length === 0" class="empty-msg">
        등록된 고정 지출이 없습니다.
      </div>

      <div class="fixed-expense-row total-row" v-if="fixedExpenses.length > 0">
        <div><strong>총 고정 지출</strong></div>
        <div class="fixed-expense-value">
          <strong class="total-amount">{{ totalFixedAmount.toLocaleString() }}원</strong>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>전체 고정 지출 내역</h3>
          <button class="close-btn" @click="isModalOpen = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-for="item in fixedExpenses" :key="item.id" class="fixed-expense-row modal-item">
            <div class="row-left">
              <span class="day-text">{{ getDayOnly(item.date) }}</span>
              <div class="info-group">
                <strong class="memo">{{ item.memo }}</strong>
                <span class="category">{{ baseStore.getCategoryName(item.categoryId) || '기타' }}</span>
              </div>
            </div>
            <strong class="amount">{{ item.amount.toLocaleString() }}원</strong>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.fixed-expense-panel {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.fixed-expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.fixed-expense-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f7ff;
  border-radius: 18px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
/* [추가] 자세히보기 버튼 스타일 */
.more-btn {
  background: white;
  border: 1px solid rgba(124, 58, 237, 0.2);
  color: #7c3aed;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.more-btn:hover {
  background: rgba(124, 58, 237, 0.03); /* 아주 연한 보라색 배경 */
}

.total-row {
  background: rgba(124, 58, 237, 0.05);
  margin-top: 8px;
}

.total-amount {
  color: #7c3aed;
  font-size: 1.1rem;
}

.empty-msg {
  text-align: center;
  padding: 20px;
  color: rgba(28, 20, 48, 0.4);
  font-size: 0.9rem;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.day-text {
  font-size: 1rem;
  color: #7c3aed;
  font-weight: 600;
  min-width: 32px; /* 날짜 너비 고정으로 줄맞춤 */
}

/* 메모 & 카테고리 수직 정렬 */
.info-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.memo {
  font-size: 1.05rem;
  font-weight: 500;
  color: #1c1430;
}

.category {
  font-size: 0.85rem;
  color: #8278aa;
}

/* 금액 스타일 */
.amount {
  font-size: 1.05rem;
  color: #1c1430;
  font-weight: 700;
}

/* 총계 행 스타일 */
.total-row {
  background: #f4f2ff;
  margin-top: 4px;
}

/* [추가] 모달 레이아웃 스타일 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}
.modal-content {
  background: white;
  width: 90%; max-width: 500px; max-height: 80vh;
  border-radius: 24px; padding: 24px;
  display: flex; flex-direction: column;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-body { overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.modal-item { background: #f8f7ff; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
</style>