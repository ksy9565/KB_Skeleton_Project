<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (!chartCanvas.value) {
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: props.items.map((item) => item.label),
      datasets: [
        {
          label: '수입',
          data: props.items.map((item) => item.income),
          backgroundColor: '#8b5cf6',
          borderRadius: 15,
          barThickness: 18,
        },
        {
          label: '지출',
          data: props.items.map((item) => item.expense),
          backgroundColor: '#f97316',
          borderRadius: 15,
          barThickness: 18,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1f2937',
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#e5e7eb',
          },
          border: {
            display: false,
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11,
            },
          },
        },
      },
    },
  });
};

onMounted(() => {
  renderChart();
});

watch(
  () => props.items,
  () => {
    renderChart();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<template>
  <article class="panel chart-panel">
    <div class="panel-head">
      <p class="panel-label">주간 기록</p>
      <button type="button">최근 5주</button>
    </div>

    <div
      class="chart-area weekly-chart-canvas"
      aria-label="수입과 지출 주간 막대 그래프"
    >
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="chart-legend">
      <span><i class="legend-dot income"></i>수입</span>
      <span><i class="legend-dot expense"></i>지출</span>
    </div>
  </article>
</template>

<style scoped>
.weekly-chart-canvas {
  position: relative;
  height: 260px;
  width: 100%;
  overflow: hidden;
}

.weekly-chart-canvas canvas {
  display: block;
  width: 100% !important;
  height: 260px !important;
}
</style>
