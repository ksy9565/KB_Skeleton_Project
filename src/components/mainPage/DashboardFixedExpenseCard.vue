<script setup>
import { computed } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBaseStore } from '@/stores/commonStore';

const transactionStore = useTransactionStore();
const baseStore = useBaseStore();

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
</script>

<template>
  <article class="panel fixed-expense-panel">
    <div class="panel-head">
      <p class="panel-label">고정 지출</p>
      <button type="button">관리</button>
    </div>

    <div class="fixed-expense-list">
      <div v-for="item in fixedExpenses" :key="item.id" class="fixed-expense-row">
        <div class="row-left">
          <span class="day-text">{{ getDayOnly(item.date) }}</span>
          
          <div class="info-group">
            <strong class="memo">{{ item.memo }}</strong>
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
        <div>
          <strong>총 고정 지출</strong>
        </div>
        <div class="fixed-expense-value">
          <strong class="total-amount">{{ totalFixedAmount.toLocaleString() }}원</strong>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.fixed-expense-panel {
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.fixed-expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
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

/* 개별 행 레이아웃 */
.fixed-expense-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f7ff;
  border-radius: 18px;
}

.row-left {
  display: flex;
  align-items: center; /* 가로 정렬 */
  gap: 20px; /* 날짜와 텍스트 사이 간격 */
}

/* 날짜 스타일 */
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

.total-label {
  font-size: 1.05rem;
  color: #1c1430;
}

</style>