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

  const labels = props.items.map((item) => {
    if (item.date) {
      const d = new Date(item.date);
      const month = d.getMonth() + 1;
      const weekNumber = parseInt(item.label); // "1주"에서 숫자만 추출
      return `${month}월 ${weekNumber}주`;
    }
    return item.label;
  });

  const sortedItems = [...props.items].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const ctx = chartCanvas.value.getContext('2d');

  const createGradient = (color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: sortedItems.map((item) => item.label),
      datasets: [
        {
          label: '수입',
          data: sortedItems.map((item) => item.income),
          backgroundColor: createGradient(
            'rgba(51, 181, 64, 0.9)',
            'rgba(51, 181, 64, 0.1)',
          ),
          borderColor: '#33B540',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: createGradient(
            'rgba(51, 181, 64, 0.7)',
            'rgba(51, 181, 64, 0.0)',
          ),
        },
        {
          label: '지출',
          data: sortedItems.map((item) => item.expense),
          backgroundColor: createGradient(
            'rgba(214, 58, 58, 0.9)',
            'rgba(214, 58, 58, 0.1)',
          ),
          borderColor: '#D63A3A',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: createGradient(
            'rgba(214, 58, 58, 0.7)',
            'rgba(214, 58, 58, 0.0)',
          ),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: 'easeOutQuart',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        datalabels: { display: false },
        tooltip: {
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          titleColor: '#1f2937',
          bodyColor: '#4b5563',
          padding: 12,
          cornerRadius: 10,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          displayColors: true,
          position: 'nearest',
          yAlign: 'bottom',
          caretPadding: 15,
          callbacks: {
            label: (context) =>
              ` ${context.dataset.label}: ${context.raw.toLocaleString()}원`,
          },
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
            color: '#f3f4f6',
            drawTicks: false,
          },
          border: {
            dash: [5, 5],
            display: false,
          },
          ticks: {
            padding: 10,
            color: '#9ca3af',
            font: {
              size: 11,
            },
            callback: (value) => value.toLocaleString(),
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
      <p class="panel-label">주간 기록 (최근 5주)</p>
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

/* 범례 스타일 예시 */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #4b5563;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

/* 수입/지출 색상 및 그림자 효과 */
.income {
  background-color: #33b540 !important;
  box-shadow: 0 0 8px rgba(51, 181, 64, 0.3);
}
.expense {
  background-color: #d63a3a !important;
  box-shadow: 0 0 8px rgba(214, 58, 58, 0.3);
}
</style>
