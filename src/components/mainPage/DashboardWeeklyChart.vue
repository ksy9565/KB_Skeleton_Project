<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <article class="panel chart-panel">
    <div class="panel-head">
      <p class="panel-label">주간 기록</p>
      <button type="button">최근 5주</button>
    </div>

    <div class="chart-area bar-chart" aria-label="수입 지출 주간 막대 그래프">
      <div v-for="week in items" :key="week.label" class="bar-group">
        <div class="bar-stack">
          <span
            class="bar income"
            :style="{ height: `${week.income}%` }"
          ></span>
          <span
            class="bar expense"
            :style="{ height: `${week.expense}%` }"
          ></span>
        </div>
        <span class="bar-label">{{ week.label }}</span>
      </div>
    </div>

    <div class="chart-legend">
      <span><i class="legend-dot income"></i>수입</span>
      <span><i class="legend-dot expense"></i>지출</span>
    </div>
  </article>
</template>
