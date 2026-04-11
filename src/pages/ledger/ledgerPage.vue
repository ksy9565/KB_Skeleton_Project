<script setup>
import { computed, onMounted, ref, reactive } from 'vue';
import DashboardSidebar from '@/components/mainPage/DashboardSidebar.vue';
import '@/styles/mainPage/logined.css';

import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { transactionService } from '@/services/transactionService';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const collapsedGroups = ref({});
const categories = ref([]);

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
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
});

const filteredCategories = computed(() => {
  if (editingItem.type === 'income') {
    return categories.value.filter((cat) => cat.id >= 1 && cat.id <= 6);
  } else {
    return categories.value.filter((cat) => cat.id >= 7);
  }
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
  if (confirm('내역을 수정하시겠습니까?')) {
    try {
      await transactionStore.updateTransaction(editingItem.id, {
        ...editingItem,
      });

      alert('수정되었습니다.');
      closeEditModal();
    } catch (error) {
      console.error('수정 실패 상세:', error.response?.data || error);
      alert('수정 중 오류가 발생했습니다.');
    }
  }
};
const handleDelete = async (id) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await transactionStore.deleteTransaction(id);
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 중 에러 발생:', error);
      alert('삭제 실패했습니다.');
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

        <button class="write-btn">
          가계부 작성 <span class="icon">✎</span>
        </button>
      </div>

      <article class="table-container">
        <div
          v-for="(items, date) in groupedTransactions"
          :key="date"
          class="date-group"
        >
          <div class="date-header" @click="toggleGroup(date)">
            <span class="arrow" :class="{ rotated: collapsedGroups[date] }"
              >▼</span
            >
            <span class="date-text">{{ date }}</span>
            <span class="count">{{ items.length }}건</span>
          </div>

          <table v-if="!collapsedGroups[date]" class="ledger-table">
            <colgroup>
              <col style="width: 80px" />
              <col style="width: 120px" />
              <col style="width: 100px" />
              <col style="width: 150px" />
              <col />
              <col style="width: 120px" />
            </colgroup>
            <thead>
              <tr>
                <th>분류</th>
                <th>카테고리</th>
                <th>내용</th>
                <th>결제수단</th>
                <th>금액</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>
                  <span :class="['badge', item.type]">
                    {{ item.type === 'income' ? '수입' : '지출' }}
                  </span>
                </td>
                <td>{{ getCategoryName(item.categoryId) }}</td>
                <td class="title-cell">{{ item.title || '내용 없음' }}</td>
                <td>{{ item.paymentMethod || '-' }}</td>
                <td
                  :class="['amount', item.type === 'income' ? 'plus' : 'minus']"
                >
                  {{ formatNumber(item.amount) }} <span class="unit">원</span>
                </td>
                <td class="memo">{{ item.memo }}</td>
                <td class="actions text-right">
                  <button class="edit-btn" @click="handleEdit(item)">
                    수정
                  </button>
                  <button class="delete-btn" @click="handleDelete(item.id)">
                    삭제
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="Object.keys(groupedTransactions).length === 0"
          class="empty-msg"
        >
          이번 달 내역이 없습니다.
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
            <label>분류</label>
            <div class="radio-wrapper">
              <input
                type="radio"
                id="edit-expense"
                value="expense"
                v-model="editingItem.type"
                @change="editingItem.paymentMethod = '체크카드'"
              />
              <label for="edit-expense" class="type-label expense">지출</label>
              <input
                type="radio"
                id="edit-income"
                value="income"
                v-model="editingItem.type"
                @change="editingItem.paymentMethod = null"
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
              <option value="체크카드">체크카드</option>
              <option value="신용카드">신용카드</option>
              <option value="현금">현금</option>
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

          <div class="form-group check-group">
            <label>
              <input type="checkbox" v-model="editingItem.isFixed" />
              고정 거래 여부
            </label>
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
.content-area {
  padding: 30px;
  background: #fcfcfc;
}

.date-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
  cursor: pointer;
  border: 1px solid #eee;
}
.date-header .arrow {
  margin-right: 10px;
  transition: transform 0.3s;
  font-size: 10px;
}
.date-header .arrow.rotated {
  transform: rotate(-90deg);
}
.date-header .date-text {
  font-weight: bold;
  flex-grow: 1;
}
.date-header .count {
  color: #888;
  font-size: 12px;
}

.ledger-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
}
.ledger-table th {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
  color: #888;
  font-size: 13px;
}
.ledger-table td {
  padding: 12px;
  border-bottom: 1px solid #f9f9f9;
  font-size: 14px;
}

.actions {
  white-space: nowrap;
}
.edit-btn,
.delete-btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 12px;
  margin-left: 5px;
}
.edit-btn:hover {
  background: #f0f0f0;
  color: #26c281;
  border-color: #26c281;
}
.delete-btn:hover {
  background: #fff5f5;
  color: #ff7675;
  border-color: #ff7675;
}

.badge.expense {
  color: #ff7675;
  font-weight: bold;
}
.badge.income {
  color: #26c281;
  font-weight: bold;
}
.amount {
  color: #8b5cf6;
  font-weight: 600;
}
.text-right {
  text-align: right;
}
.empty-msg {
  text-align: center;
  padding: 50px;
  color: #aaa;
}
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 10px 5px;
}

.month-viewer {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #fff;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.current-month {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  min-width: 110px;
  text-align: center;
}

.month-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  padding: 0 5px;
  transition: color 0.2s;
}

.month-btn:hover {
  color: #4a72ff;
}

.write-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: #fff;
  color: #7c3aed;
  border: 1px solid rgba(95, 72, 155, 0.08);
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(95, 72, 155, 0.08);
}

.write-btn:hover {
  background-color: #f0f4ff;
  box-shadow: 0 4px 8px rgba(74, 114, 255, 0.15);
  transform: translateY(-1px);
}

.write-btn .icon {
  font-size: 16px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 24px;
  width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #1f2937;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #7c3aed;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #4b5563;
  margin-bottom: 4px;
}
.radio-wrapper {
  display: flex;
  gap: 10px;
}
.modal-footer {
  margin-top: 30px;
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  background: #f3f4f6;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 600;
  color: #6b7280;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  flex: 2;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
}
</style>
