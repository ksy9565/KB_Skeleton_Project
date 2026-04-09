<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { debounce } from 'lodash-es'; // 또는 직접 구현

// Chart.js 필수 구성 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

// 현재 화면 상태
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value <= 768);

// 리사이즈 이벤트 리스너
const updateWidth = debounce(() => {
  windowWidth.value = window.innerWidth;
}, 200);

onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));

// Chart.js 데이터 형식으로 변환
const chartData = computed(() => ({
  labels: props.items.map((item) => item.label),
  datasets: [
    {
      backgroundColor: props.items.map((item) => item.color),
      data: props.items.map((item) => item.value),
      borderWidth: 0, // 경계선 제거 (깔끔한 디자인)
      hoverOffset: 0, // 호버 시 조각이 튀어나오는 효과
    },
  ],
}));

// Chart.js 옵션 설정
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // 기본 범례는 숨기고 기존 커스텀 범례 사용
    tooltip: {
      enabled: !isMobile.value, // 호버 시 툴팁 활성화 기능: mobile 아닐 때에만 적용
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          return ` ${label}: ${value}%`;
        },
      },
    },
    datalabels: {
      // 데이터레이블 설정
      color: '#000', // 글자 색상
      font: {
        size: 11,
      },
      // 레이블 내용 설정 (항목명 + 퍼센트)
      formatter: (value, context) => {
        const label = context.chart.data.labels[context.dataIndex];
        return `${label}\n${value}%`;
      },
      textAlign: 'center',
      // 화면 너비가 768px 미만일 때만 레이블 표시
      display: isMobile.value,
    },
  },
}));
const chartKey = computed(() =>
  isMobile.value ? 'mobile-chart' : 'desktop-chart',
);
</script>

<template>
  <article class="panel chart-panel">
    <div class="panel-head">
      <p class="panel-label">카테고리별 지출</p>
      <button type="button">이번 달</button>
    </div>

    <div class="chart-area pie-layout">
      <!-- 차트 컨테이너 -->
      <div class="pie-chart-container">
        <Pie :key="chartKey" :data="chartData" :options="chartOptions" />
      </div>

      <!-- 반응형 그리드 범례 -->
      <div class="category-legend" v-if="!isMobile">
        <div
          v-for="category in items"
          :key="category.label"
          class="category-row"
        >
          <span
            class="category-swatch"
            :style="{ background: category.color }"
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
