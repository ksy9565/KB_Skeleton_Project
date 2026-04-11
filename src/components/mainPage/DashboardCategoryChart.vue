<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { debounce } from 'lodash-es';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { useBaseStore } from '@/stores/commonStore';
import { storeToRefs } from 'pinia';

// Chart.js 필수 구성 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const transactionStore = useTransactionStore();
const authStore = useAuthStore();
const baseStore = useBaseStore();

const { transactions, isLoading, currentMonth } = storeToRefs(transactionStore);
const { categories } = storeToRefs(baseStore);
// 현재 화면 상태
const windowWidth = ref(window.innerWidth);

// 리사이즈 이벤트 리스너
const updateWidth = debounce(() => {
  windowWidth.value = window.innerWidth;
}, 200);

onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));

const loadCategoryData = async () => {
  const userId = authStore.currentUser?.id;
  if (!userId) return;

  //예: 2026년 4월 데이터 조회
  await transactionStore.getCategoryStats(userId, currentMonth.value);
};

onMounted(loadCategoryData);

const items = computed(() => {
  // 전체 중 지출만 남김
  const expenses = transactions.value.filter((t) => t.type === 'expense');

  // 전체 지출 합계 계산
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // 데이터가 없으면 빈 배열 반환
  if (totalExpense === 0) return { labels: [], datasets: [] };

  // 카테고리별 금액 합산
  const categoryMap = expenses.reduce((acc, t) => {
    const categoryKey = t.categoryId ?? t.category ?? t.title ?? '미분류';
    acc[categoryKey] = (acc[categoryKey] || 0) + t.amount;
    return acc;
  }, {});

  return Object.keys(categoryMap)
    .map((catId) => {
      // categories 배열에서 일치하는 카테고리 정보 찾기
      const categoryInfo = categories.value.find(
        (c) => c.id === Number(catId) || c.name === catId,
      );
      const amount = categoryMap[catId];

      // 퍼센티지 계산 (소수점 첫째 자리까지)
      const percentage = Number(((amount / totalExpense) * 100).toFixed(1));

      return {
        label: categoryInfo?.name || String(catId),
        value: percentage,
        color: baseStore.getCategoryColor(
          categoryInfo?.id ?? categoryInfo?.name ?? catId,
        ),
      };
    })
    .sort((a, b) => b.value - a.value);
});

const chartData = computed(() => {
  if (items.value.length === 0) {
    // 데이터 없을 시
    return { labels: [], datasets: [] };
  }
  return {
    labels: items.value.map((i) => i.label),
    datasets: [
      {
        data: items.value.map((i) => i.value),
        backgroundColor: items.value.map((i) => i.color),
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };
});

// Chart.js 옵션 설정
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // 기본 범례는 숨기고 기존 커스텀 범례 사용
    tooltip: {
      enabled: true, // 호버 시 툴팁 활성화 기능
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw || 0;
          return ` ${label}: ${value}%`;
        },
      },
    },
    datalabels: {
      display: true,
      color: '#000', // 글자 색상
      font: {
        size: 11,
      },
      // 레이블 내용 설정 (항목명 + 퍼센트)
      formatter: (value, context) => {
        // value를 숫자로 변환 (이미 숫자라면 생략 가능)
        const numericValue = Number(value);

        // 9.0 이상인 경우에만 레이블 표시
        if (numericValue >= 9.0) {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}\n${numericValue}%`;
        }

        // 9.0 미만인 경우 아무것도 표시하지 않음
        return '';
      },
      textAlign: 'center',
      // 화면 너비가 768px 미만일 때만 레이블 표시
    },
  },
}));
</script>

<template>
  <article class="panel chart-panel">
    <div class="panel-head">
      <p class="panel-label">이번 달 카테고리별 지출</p>
      <div v-if="isLoading" class="loader">불러오는 중입니다.</div>
    </div>

    <div class="chart-area pie-layout">
      <!-- 차트 컨테이너 -->
      <div class="pie-chart-container">
        <Pie
          v-if="items.length > 0"
          :data="chartData"
          :options="chartOptions"
        />
        <div v-else-if="!isLoading" class="no-data">
          이번 달 지출 내역이 없습니다.
        </div>
      </div>

      <!-- 반응형 그리드 범례 -->
      <div class="category-legend" v-if="items.length > 0">
        <div
          v-for="(category, index) in items"
          :key="category.label"
          class="category-row"
        >
          <span
            class="category-swatch"
            :style="{
              backgroundColor: category.color,
            }"
          ></span>
          <div class="category-info">
            <strong class="label">{{ category.label }}</strong>
            <p class="value">{{ category.value }}%</p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.chart-panel {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
}

/* 기본 레이아웃: 세로 정렬 (모바일/좁은 화면) */
.pie-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.pie-chart-container {
  position: relative;
  width: 200px;
  height: 200px;
}

/* 범례 그리드 설정 */
.category-legend {
  display: grid;
  width: 100%;
  /* 기본 2열 구성 */
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-swatch {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.category-info .label {
  display: block;
  font-size: 14px;
  color: #333;
}

.category-info .value {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* --- 반응형 분기점 --- */

/* 1. 화면이 조금 넓어질 때 (예: 태블릿 이상, 3열로 변경) */
/* @media (min-width: 480px) {
  .category-legend {
    grid-template-columns: repeat(3, 1fr);
  }
} */

/* 2. 카드가 충분히 길어질 때 (가로 배치로 전환) */
@media (min-width: 769px) {
  .pie-layout {
    flex-direction: row; /* 가로 정렬로 변경 */
    justify-content: space-around;
  }

  .category-legend {
    flex: 1;
    /* 가로로 길어질 때 열 개수를 더 늘리고 싶다면 수정 가능 */
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
