<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  userId: [Number, String],
  categories: Array, // { id, name, color}
  paymentMethods: Array, // { name, color }
});

const emit = defineEmits(['close', 'save']);

// 폼 초기 데이터
const initialForm = {
  type: 'expense',
  categoryId: '',
  paymentMethod: '',
  amount: null,
  description: '',
  date: new Date().toISOString().split('T')[0],
};

const form = ref({ ...initialForm });

// 수입/지출 선택에 따른 카테고리 필터링
const filteredCategories = computed(() => {
  return props.categories.filter((cat) => cat.type === form.type);
});

// 수입/지출 선택에 따른 결제수단 필터링
const filteredMethods = computed(() => {
  return props.paymentMethods.filter((pay) => pay.type === form.type);
});

// 구분이 바뀔 때마다 선택된 카테고리 초기화
watch(
  () => form.type,
  () => {
    form.value.categoryId = '';
  },
);

const closeModal = () => {
  form.value = { ...initialForm }; // 폼 초기화
  emit('close');
};

const saveTransaction = () => {
  if (!form.value.categoryId || !form.value.amount) return;
  emit('save', { ...form.value });
  closeModal();
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h2>거래 내역 추가</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </header>

      <form @submit.prevent="saveTransaction">
        <!-- 1. 수입/지출 선택 -->
        <div class="form-group">
          <label>구분</label>
          <div class="type-selector">
            <button
              type="button"
              :class="{ active: form.type === 'income' }"
              @click="form.type = 'income'"
            >
              수입
            </button>
            <button
              type="button"
              :class="{ active: form.type === 'expense' }"
              @click="form.type = 'expense'"
            >
              지출
            </button>
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
        <div class="form-group" v-if="form.type === 'expense'">
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
          <input
            type="number"
            v-model.number="form.amount"
            placeholder="0"
            required
          />
        </div>

        <!-- 5. 한줄 메모 -->
        <div class="form-group">
          <label>메모</label>
          <input
            type="text"
            v-model="form.description"
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
</style>
