<script setup>
import { computed, onMounted, ref, reactive } from 'vue';
import DashboardSidebar from '@/components/mainPage/DashboardSidebar.vue';
import addTransactionModalSelectDate from '../subPage/addTransactionModalSelectDate.vue';

import '@/styles/mainPage/logined.css';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';

import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBaseStore } from '@/stores/commonStore';
import { transactionService } from '@/services/transactionService';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const baseStore = useBaseStore();
const toast = useToast();

const userId = computed(() => authStore.currentUser?.id || 'guest');

const { categories, paymentMethods } = storeToRefs(baseStore);
const { addTransaction2 } = transactionStore;

const modalOpen = ref(false);
const handleSave = async (data) => {
  await addTransaction2(data);
  modalOpen.value = false;
};

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const collapsedGroups = ref({});
// const categories = ref([]); // 카테고리 목록 저장

const viewDate = ref(new Date());

const currentYear = computed(() => viewDate.value.getFullYear());
const currentMonth = computed(() => viewDate.value.getMonth() + 1);

const moveMonth = (offset) => {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() + offset,
    1,
  );
};
const isEditModalOpen = ref(false);
const editingItem = reactive({
  id: null,
  date: '',
  type: 'expense',
  categoryId: null,
  paymentMethod: '',
  amount: 0,
  memo: '',
  isFixed: false,
});

const groupedTransactions = computed(() => {
  const source = transactionStore.transactions;

  const filtered = source.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === currentYear.value &&
      itemDate.getMonth() + 1 === currentMonth.value
    );
  });
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  return sorted.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});
});

// 수입/지출 선택에 따른 카테고리 필터링
const filteredCategories = computed(() => {
  if (editingItem.type === 'income') {
    return categories.value.filter((cat) => cat.id >= 1 && cat.id <= 6);
  } else {
    return categories.value.filter((cat) => cat.id >= 7);
  }
});
// 수입/지출 선택에 따른 결제수단 필터링
const filteredMethods = computed(() => {
  return paymentMethods.value.filter((pay) => {
    if (editingItem.type === 'income') {
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

const toggleGroup = (date) => {
  collapsedGroups.value[date] = !collapsedGroups.value[date];
};

const handleEdit = (item) => {
  Object.assign(editingItem, { ...item });
  isEditModalOpen.value = true;
};
const closeEditModal = () => {
  isEditModalOpen.value = false;
};
const handleUpdateSubmit = async () => {
  try {
    await transactionStore.updateTransaction(editingItem.id, {
      ...editingItem,
    });

    toast.success('수정되었습니다.', {
      timeout: 2000,
      position: 'bottom-center',
    });

    closeEditModal();
  } catch (error) {
    console.error('수정 실패 상세:', error.response?.data || error);
    toast.error('수정 중 오류가 발생했습니다. 다시 시도해주세요.', {
      timeout: 4000,
    });
  }
};
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: '내역을 삭제하시겠습니까?',
    text: '수정 후에는 이전 데이터로 복구할 수 없습니다.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: '삭제',

    cancelButtonColor: '#7c4dff',
    cancelButtonText: '취소',
    position: 'center', // 이건 중앙이 제일 예쁩니다
  });
  if (result.isConfirmed) {
    try {
      await transactionStore.deleteTransaction(id);

      toast.success('삭제되었습니다.', {
        timeout: 2000,
        position: 'bottom-center',
      });
    } catch (error) {
      console.error('삭제 중 에러 발생:', error);
      toast.error('삭제 중 오류가 발생하였습니다. 다시 시도해주세요.', {
        timeout: 4000,
      });
    }
  }
};

const formatNumber = (num) => num.toLocaleString();

const getCategoryName = (id) => {
  const category = categories.value.find((c) => c.id === id);
  return category ? category.name : '미지정';
};

onMounted(async () => {
  await transactionStore.fetchTransactions();
  try {
    const response = await fetch('http://localhost:3000/catgories');
    categories.value = await response.json();
  } catch (error) {
    console.error('카테고리 로드 실패:', error);
  }
});
</script>

<template>
  <div class="dashboard-shell">
    <DashboardSidebar
      :groups="[
        { title: '계정', items: ['대시보드', '가계부', '통계', '카드 관리'] },

        { title: '설정', items: ['예산 설정', '카테고리 설정', '알림 설정'] },
      ]"
      :show-battery="true"
    />

    <section class="content-area">
      <div class="filter-bar">
        <div class="month-viewer">
          <button class="month-btn" @click="moveMonth(-1)">&lt;</button>
          <h2 class="current-month">
            {{ currentYear }}년 {{ currentMonth }}월
          </h2>
          <button class="month-btn" @click="moveMonth(1)">&gt;</button>
        </div>

        <button class="write-btn" @click="modalOpen = true">
          가계부 작성 <span class="icon">✎</span>
        </button>
        <addTransactionModalSelectDate
          :is-open="modalOpen"
          :userId="userId"
          :categories="categories"
          :paymentMethods="paymentMethods"
          @close="modalOpen = false"
          @save="handleSave"
        />
      </div>

      <article class="ledger-container">
        <div class="list-header">
          <div class="col-date">날짜</div>
          <div class="col-type">구분</div>
          <div class="col-cat">카테고리</div>
          <div class="col-title">내용</div>
          <div class="col-method">결제수단</div>
          <div class="col-amount">금액(원)</div>
          <div class="col-memo">메모</div>
          <div class="col-actions">관리</div>
        </div>

      <article class="ledger-container">
        <div class="list-header">
          <div class="col-date">날짜</div>
          <div class="col-type">분류</div>
          <div class="col-cat">카테고리</div>
          <div class="col-title">내용</div>
          <div class="col-method">결제수단</div>
          <div class="col-amount">금액(원)</div>
          <div class="col-memo">메모</div>
          <div class="col-actions">관리</div>
        </div>

        <div
          v-for="(items, date) in groupedTransactions"
          :key="date"
          class="date-group-row-row"
        >
          <div class="date-toggle-toggle-header" @click="toggleGroup(date)">
            <div class="col-date">
              <div class="col-date">
              <span class="arrow" :class="{ rotated: collapsedGroups[date] }"
                  >▼</span
                >
                <span class="date-text">{{ date }}</span>
            </div>
            <div class="col-summary">
              </div>
            <div class="col-summary">
              <span class="count">{{ items.length }}건</span>
            </div>
            </div>
          </div>

          <div v-if="!collapsedGroups[date]" class="date-content">
            <div v-for="item in items" :key="item.id" class="transaction-row">
              <div class="col-date"></div>
              <div class="col-type">
                <span :class="['badge', item.type]">{{
                  item.type === 'income' ? '수입' : '지출'
                }}</span>
              </div>
              <div class="col-cat">{{ getCategoryName(item.categoryId) }}</div>
              <div class="col-title">{{ item.title || '내용 없음' }}</div>
              <div class="col-method">{{ item.paymentMethod || '-' }}</div>
              <div class="col-amount" :class="item.type">
                {{ formatNumber(item.amount) }}
              </div>
              <div class="col-memo">{{ item.memo }}</div>
              <div class="col-actions">
                <button class="small-btn edit" @click="handleEdit(item)">
                  수정
                </button>
                <button class="small-btn delete" @click="handleDelete(item.id)">
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
    <div
      v-if="isEditModalOpen"
      class="modal-overlay"
      @click.self="closeEditModal"
    >
      <div class="modal-content">
        <header class="modal-header">
          <h2>거래 내역 수정</h2>
        </header>

        <form @submit.prevent="handleUpdateSubmit" class="edit-form">
          <div class="form-group">
            <label>날짜</label>
            <input type="date" v-model="editingItem.date" required />
          </div>

          <div class="form-group">
            <label>구분</label>
            <div class="radio-wrapper">
              <input
                type="radio"
                id="edit-expense"
                value="expense"
                v-model="editingItem.type"
              />
              <label for="edit-expense" class="type-label expense">지출</label>
              <input
                type="radio"
                id="edit-income"
                value="income"
                v-model="editingItem.type"
              />
              <label for="edit-income" class="type-label income">수입</label>
            </div>
          </div>

          <div class="form-group">
            <label>카테고리</label>
            <select v-model="editingItem.categoryId" required>
              <option :value="null" disabled>카테고리를 선택하세요</option>
              <option
                v-for="cat in filteredCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group" v-if="editingItem.type === 'expense'">
            <label>결제수단</label>
            <select v-model="editingItem.paymentMethod">
              <option
                v-for="method in filteredMethods"
                :key="method.name"
                :value="method.name"
              >
                {{ method.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>금액</label>
            <input type="number" v-model.number="editingItem.amount" required />
          </div>

          <div class="form-group">
            <label>메모</label>
            <textarea v-model="editingItem.memo" rows="3"></textarea>
          </div>

          <div class="form-group" v-if="editingItem.type === 'expense'">
            <label>지출 형태</label>
            <div class="type-selector">
              <button
                type="button"
                :class="{ active: editingItem.isFixed === true }"
                @click="editingItem.isFixed = !editingItem.isFixed"
              >
                고정 지출
              </button>
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" class="cancel-btn" @click="closeEditModal">
              취소
            </button>
            <button type="submit" class="save-btn">수정 완료</button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

.cancel-btn {
  background: #eee;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
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
