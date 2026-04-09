<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.js 필수 구성 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

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
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // 기본 범례는 숨기고 기존 커스텀 범례 사용
    },
    tooltip: {
      enabled: true, // 호버 시 툴팁 활성화
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          return ` ${label}: ${value}%`;
        },
      },
    },
  },
};
</script>

<template>
  <article class="panel chart-panel">
    <div class="panel-head">
      <p class="panel-label">카테고리별 지출</p>
      <button type="button">이번 달</button>
    </div>

    <div class="chart-area pie-layout">
      <!-- 기존 div 대신 Pie 컴포넌트 사용 -->
      <div class="pie-chart-container">
        <Pie :data="chartData" :options="chartOptions" />
      </div>

      <div class="category-legend">
        <div
          v-for="category in items"
          :key="category.label"
          class="category-row"
        >
          <span
            class="category-swatch"
            :style="{ background: category.color }"
          ></span>
          <div>
            <strong>{{ category.label }}</strong>
            <p>{{ category.value }}%</p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* 차트 크기 조절을 위한 컨테이너 스타일 */
.pie-chart-container {
  position: relative;
  width: 200px; /* 원하는 크기로 조절 */
  height: 200px;
}

.pie-layout {
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>
