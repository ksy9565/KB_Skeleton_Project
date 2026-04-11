<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  userId: [Number, String],
  categories: Array, // { id, name, color}
  paymentMethods: Array, // { name, color }
  incomePaymentMethods: Array, // { name, color }
  selectedDay: String,
});

const emit = defineEmits(['close', 'save']);

// 폼 초기 데이터
const initialForm = {
  userId: null,
  type: 'expense',
  amount: null,
  categoryId: '',
  paymentMethod: '',
  date: props.selectedDay,
  memo: '',
  isFixed: false,
};

const form = ref({ ...initialForm });

// 수입/지출 선택에 따른 카테고리 필터링
const filteredCategories = computed(() => {
  return props.categories.filter((cat) => {
    return form.value.type === 'income'
      ? Number(cat.id) >= 1 && Number(cat.id) <= 6
      : Number(cat.id) >= 7;
  });
});

// 수입/지출 선택에 따른 결제수단 필터링
const filteredMethods = computed(() => {
  return props.paymentMethods.filter((pay) => {
    if (form.value.type === 'income') {
      return ['현금', '계좌이체', '환불', '포인트적립/캐시백'].includes(
        pay.name,
      );
    } else {
      return ['신용카드', '체크카드', '교통카드', '현금', '계좌이체'].includes(
        pay.name,
      );
    }
  });
});

// 구분이 바뀔 때마다 선택된 카테고리 초기화
watch(
  () => form.value.type,
  () => {
    form.value.categoryId = '';
    form.value.paymentMethod = '';
    form.value.isFixed = false;
  },
);

watch(
  () => [props.isOpen, props.userId, props.selectedDay],
  ([isOpen, userId, selectedDay]) => {
  () => [props.isOpen, props.userId, props.selectedDay],
  ([isOpen, userId, selectedDay]) => {
    if (isOpen) {
      form.value.userId = userId ?? null;
      if (selectedDay) {
        form.value.date = selectedDay;
      }
      if (selectedDay) {
        form.value.date = selectedDay;
      }
    }
  },
  { immediate: true },
);

const closeModal = () => {
  form.value = { ...initialForm }; // 폼 초기화
  emit('close');
};

const saveTransaction = () => {
  if (
    !form.value.categoryId ||
    !form.value.paymentMethod ||
    !form.value.amount
  ) {
    alert('카테고리, 결제 수단, 금액을 모두 입력해주세요');
    return;
  }

  if (form.value.amount < 0) {
    alert('금액은 0 이상의 숫자만 입력 가능합니다');
    form.value.amount = null;
    return;
  }
  emit('save', {
    ...form.value,
  });
  closeModal();
};

// YYYY년 MM월 DD일 변환 표시
const formattedDate = computed(() => {
  if (!form.value.date) return '';

  const [year, month, day] = form.value.date.split('-');
  return `${year}년 ${month}월 ${day}일`;
});
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h2>거래 내역 추가</h2>
      </header>
      <div class="form-group">
        <h3>{{ formattedDate }}</h3>
      </div>
      <form @submit.prevent="saveTransaction" class="edit-form">
        <!-- 1. 수입/지출 선택 -->
        <div class="form-group">
          <label>구분</label>
          <div class="radio-wrapper">
            <input
              type="radio"
              id="edit-expense"
              value="expense"
              v-model="form.type"
            />
            <label for="edit-expense" class="type-label expense">지출</label>
            <input
              type="radio"
              id="edit-income"
              value="income"
              v-model="form.type"
            />
            <label for="edit-income" class="type-label income">수입</label>
          </div>
        </div>

        <!-- 2. 카테고리 선택 (구분에 따라 목록이 달라짐) -->
        <div class="form-group">
          <label>카테고리</label>
          <select v-model="form.categoryId" required>
            <option value="" disabled>카테고리를 선택하세요</option>
            <option
              v-for="cat in filteredCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- 3. 지출 형태 (결제 수단) -->
        <div class="form-group">
          <label>결제 수단</label>
          <select v-model="form.paymentMethod" required>
            <option value="" disabled>결제 수단을 선택하세요</option>
            <option
              v-for="method in filteredMethods"
              :key="method.name"
              :value="method.name"
            >
              {{ method.name }}
            </option>
          </select>
        </div>

        <!-- 4. 금액 입력 -->
        <div class="form-group">
          <label>금액</label>
          <div class="amount-input-wrapper">
            <input
              type="number"
              v-model.number="form.amount"
              placeholder="0 이상의 금액만 가능합니다"
              min="0"
              required
              class="no-spinners"
            />
          </div>
        </div>

        <!-- 6. 지출 형태 선택 -->
        <div class="form-group" v-if="form.type === 'expense'">
          <label>지출 형태</label>
          <div class="type-selector">
            <button
              type="button"
              :class="{ active: form.isFixed === true }"
              @click="form.isFixed = !form.isFixed"
            >
              고정 지출
            </button>
          </div>
        </div>

        <!-- 7. 한줄 메모 -->
        <div class="form-group">
          <label>메모</label>
          <input
            type="text"
            v-model="form.memo"
            placeholder="내용을 입력하세요"
          />
        </div>

        <!-- 하단 버튼 -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeModal">
            취소
          </button>
          <button type="submit" class="btn-save">저장하기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 0.9rem;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}

.type-selector {
  display: flex;
  gap: 8px;
}
.type-selector button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 6px;
}
.type-selector button.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.modal-footer button {
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}
.btn-cancel {
  background: #f5f5f5;
  color: #666;
}
.btn-save {
  background: #4a90e2;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
/* 기본 숫자 입력창의 화살표 숨기기 */
.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.amount-input-wrapper input {
  flex: 1;
  padding-right: 40px; /* 버튼 공간 확보 */
}

.step-buttons {
  position: absolute;
  right: 5px;
  display: flex;
  flex-direction: column;
}

.step-buttons button {
  background: none;
  border: none;
  font-size: 10px;
  cursor: pointer;
  padding: 2px 5px;
  color: #666;
}

.step-buttons button:hover {
  color: #4a90e2;
}
.ledger-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-top: 10px auto 0;
  max-width: 1400px;
  width: 95%;
}

.list-header,
.date-toggle-header,
.transaction-row {
  display: grid;
  grid-template-columns:
    140px
    70px
    110px
    1fr
    100px
    120px
    minmax(200px, 1fr)
    110px;

  align-items: center;
  gap: 20px;
  padding: 18px 24px;
}

.col-amount {
  font-weight: 700;
  text-align: right;
  padding-right: 10px;
}

.list-header {
  background-color: #fcfaff;
  border-bottom: 1px solid #eeeaff;
  color: #718096;
  font-weight: 600;
  font-size: 0.9rem;
}

.date-group-row {
  border-bottom: 1px solid #f8f9fe;
}

.date-toggle-header {
  background: #ffffff;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f3f9;
}

.date-toggle-header:hover {
  background: #fbfaff;
}

.date-text {
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem;
}

.arrow {
  display: inline-block;
  margin-right: 12px;
  color: #7c4dff;
  transition: transform 0.3s ease;
  font-size: 0.8rem;
}

.arrow.rotated {
  transform: rotate(-90deg);
}

.col-summary .count {
  background: #f0ebff;
  color: #7c4dff;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.transaction-row {
  background: white;
  font-size: 0.95rem;
  border-bottom: 1px dashed #f1f3f9;
}

.transaction-row:last-child {
  border-bottom: none;
}

.transaction-row:hover {
  background-color: #f9f8ff;
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  text-align: center;
  width: 100%;
}

.badge.income {
  background-color: #e6fffa;
  color: #38b2ac;
}

.badge.expense {
  background-color: #fff5f5;
  color: #e53e3e;
}

.col-amount {
  font-weight: 700;
  text-align: right;
  font-family: 'Pretendard', sans-serif;
}
.col-amount.income {
  color: #38b2ac;
}
.col-amount.expense {
  color: #e53e3e;
}

.col-title,
.col-memo {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4a5568;
}

.small-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.small-btn.edit:hover {
  border-color: #7c4dff;
  color: #7c4dff;
}

.small-btn.delete:hover {
  background: #fff5f5;
  border-color: #feb2b2;
  color: #e53e3e;
}

@media (max-width: 1200px) {
  .list-header,
  .date-toggle-header,
  .transaction-row {
    grid-template-columns: 140px 70px 100px 1fr 100px 110px 100px;
  }
  .col-memo {
    display: none;
  }
}

@media (max-width: 768px) {
  .ledger-container {
    overflow-x: auto;
  }
  .list-header {
    display: none;
  }
  .date-toggle-header,
  .transaction-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 8px;
    position: relative;
  }
  .date-toggle-header {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .date-toggle-header .col-date {
    display: block;
    width: auto;
  }

  .transaction-row .col-date {
    display: none;
  }
  .col-date {
    display: none;
  }

  .col-type,
  .col-cat {
    display: inline-flex;
    width: auto;
  }

  .col-title {
    white-space: normal;
  }

  .col-amount {
    width: 100%;
    text-align: right;
    font-size: 1.2rem;
    margin: 8px 0;
  }

  .col-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #f1f3f9;
    padding-top: 12px;
  }
}
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  margin-top: 40px;
}

.month-viewer {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #eef0f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.month-btn {
  background: none;
  border: none;
  color: #7c4dff;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0 10px;
  transition: opacity 0.2s;
}

.month-btn:hover {
  opacity: 0.6;
}

.current-month {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 15px;
}

.write-btn {
  background: white;
  color: #7c4dff;
  border: 1px solid #7c4dff;
  margin-right: 20px;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 77, 255, 0.1);
}

.write-btn:hover {
  background: #7c4dff;
  color: white;
  transform: translateY(-2px);
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 24px;
  text-align: center;
}

.edit-form .form-group {
  margin-bottom: 20px;
}

.edit-form label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #718096;
  margin-bottom: 8px;
}

.edit-form input[type='text'],
.edit-form input[type='number'],
.edit-form input[type='date'],
.edit-form select,
.edit-form textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  background-color: #f8faff;
  font-size: 1rem;
  transition: all 0.2s;
}

.edit-form input:focus,
.edit-form select:focus {
  outline: none;
  border-color: #7c4dff;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);
}

.radio-wrapper {
  display: flex;
  gap: 12px;
}

.radio-wrapper input[type='radio'] {
  display: none;
}

.type-label {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #edf2f7;
  cursor: pointer;
  background: #f8fafc;
  color: #a0aec0;
  transition: all 0.2s;
}

#edit-expense:checked + .expense {
  background: #fff5f5;
  color: #e53e3e;
  border-color: #feb2b2;
}

#edit-income:checked + .income {
  background: #ccefff;
  color: #38b2ac;
  border-color: #b2f5ea;
}

.type-selector {
  display: flex;
  gap: 8px;
}
.type-selector button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 6px;
}
.type-selector button.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.1s;
}

.cancel-btn {
  background: #f7fafc;
  color: #718096;
}

.save-btn {
  background: #7c4dff;
  color: white;
}

.save-btn:active,
.cancel-btn:active {
  transform: scale(0.98);
}
</style>
