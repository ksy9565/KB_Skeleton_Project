<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { transactionService } from '@/services/transactionService';
import addTransactionModal from '@/pages/subPage/addTransactionModal.vue';
import { useBaseStore } from '@/stores/commonStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { storeToRefs } from 'pinia';
const modalOpen = ref(false);
const selectedDate = ref(null);

const currentDate = ref(new Date());
const transactionStore = useTransactionStore();
const authStore = useAuthStore();
const userId = computed(() => authStore.currentUser?.id || 'guest');
const baseStore = useBaseStore();

const { categories, paymentMethods } = storeToRefs(baseStore);
const { transactions, currentMonth } = storeToRefs(transactionStore);
const { addTransaction2 } = transactionStore;

const handleSave = async (data) => {
  await addTransaction2(data);
  modalOpen.value = false;
};

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());

const prevMonth = () => {
  currentDate.value = new Date(year.value, month.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(year.value, month.value + 1, 1);
};

// 1. 달력 생성
const calendarDays = computed(() => {
  const firstDayOfMonth = new Date(year.value, month.value, 1).getDay(); // 1일의 요일 (0:일 ~ 6:토)
  const lastDateOfMonth = new Date(year.value, month.value + 1, 0).getDate(); // 이번 달 마지막 날짜 (28~31)

  const days = [];
  let currentWeek = [];

  // 1일 앞의 빈 칸 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }

  // 1일부터 마지막 날까지 채우기
  for (let date = 1; date <= lastDateOfMonth; date++) {
    currentWeek.push(date);

    // 토요일(6)이 되면 한 주를 마감하고 새 주 시작
    if (currentWeek.length === 7) {
      days.push(currentWeek);
      currentWeek = [];
    }
  }

  // 마지막 주 남은 빈 칸 채우기
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    days.push(currentWeek);
  }

  return days;
});

// 2. 서버에서 현재 유저의 트랜잭션 조회
async function fetchTransactions() {
  const userId = authStore.currentUser?.id;

  if (!userId) {
    console.warn('유저 정보가 없습니다.');
    return;
  }

  try {
    const data = await transactionService.getTransactionsByUserId(userId);
    transactions.value = data;
    console.log('로드된 내역:', data);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
}

// 3. 날짜별 수입/지출 합산 데이터 생성
const dailySummary = computed(() => {
  const summary = {};

  transactions.value.forEach((tx) => {
    const dateKey = tx.date;
    if (!summary[dateKey]) {
      summary[dateKey] = { income: 0, expense: 0 };
    }

    if (tx.type === 'income') {
      summary[dateKey].income += tx.amount;
    } else {
      summary[dateKey].expense += tx.amount;
    }
  });

  return summary;
});

// 4. 달력의 숫자를 "2026-04-01" 형식의 키로 변환
const getDateKey = (day) => {
  if (!day) return null;
  const formattedMonth = String(month.value + 1).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  return `${year.value}-${formattedMonth}-${formattedDay}`;
};
// 날짜 저장 후 모달 열기
const openModalWithDate = (day) => {
  selectedDate.value = getDateKey(day);
  if (selectedDate.value) modalOpen.value = true;
};

onMounted(() => {
  fetchTransactions();
});
</script>

<template>
  <article class="panel calendar-panel">
    <div class="calendar-header">
      <div class="month-selector">
        <button type="button" class="nav-btn" @click="prevMonth">
          <i class="prev-icon">&lt;</i>
        </button>

        <h3 class="current-month">{{ year }}년 {{ month + 1 }}월</h3>

        <button type="button" class="nav-btn" @click="nextMonth">
          <i class="next-icon">&gt;</i>
        </button>
      </div>
    </div>

    <div class="calendar-grid" aria-label="월간 캘린더">
      <div class="calendar-weekdays">
        <span class="sun">일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span class="sat">토</span>
      </div>

      <div
        v-for="(week, weekIndex) in calendarDays"
        :key="weekIndex"
        class="calendar-week"
      >
        <div
          v-for="(day, dayIndex) in week"
          :key="`${weekIndex}-${dayIndex}`"
          class="calendar-day"
          :class="{
            empty: !day,
            'sun-text': dayIndex === 0 && day,
            'sat-text': dayIndex === 6 && day,
          }"
          @click="openModalWithDate(day)"
        >
          <span class="day-number">{{ day || '' }}</span>

          <div v-if="day && dailySummary[getDateKey(day)]" class="day-stats">
            <span
              v-if="dailySummary[getDateKey(day)].income > 0"
              class="income-amount"
            >
              +{{ dailySummary[getDateKey(day)].income.toLocaleString() }}
            </span>
            <span
              v-if="dailySummary[getDateKey(day)].expense > 0"
              class="expense-amount"
            >
              -{{ dailySummary[getDateKey(day)].expense.toLocaleString() }}
            </span>
          </div>
        </div>
      </div>

      <addTransactionModal
        :is-open="modalOpen"
        :userId="userId"
        :categories="categories"
        :paymentMethods="paymentMethods"
        :selectedDay="selectedDate"
        @close="modalOpen = false"
        @save="handleSave"
      />
    </div>
  </article>
</template>

<style scoped>
.calendar-weekdays span.sun {
  color: #ef4444;
  font-weight: 700;
}
.calendar-weekdays span.sat {
  color: #3b82f6;
  font-weight: 700;
}

.calendar-day {
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 8px 6px;
  background: transparent !important;
  border-right: 1px solid rgba(130, 120, 170, 0.1);
  border-bottom: 1px solid rgba(130, 120, 170, 0.1);
}

.calendar-day.empty {
  border: none;
}

.sun-text .day-number {
  color: #ef4444 !important;
}
.sat-text .day-number {
  color: #3b82f6 !important;
}

.day-number {
  font-size: 0.85rem;
  font-weight: 600;
  color: #31204f;
  margin-bottom: auto;
}

.day-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

/* .amt-income {
  font-size: 0.72rem;
  color: #17a34a !important;
  text-align: right;
  font-weight: 700;
}

.amt-expense {
  font-size: 0.72rem;
  color: #ef4444 !important;
  text-align: right;
  font-weight: 700;
} */

.nav-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  border-radius: 50%;
}
</style>
