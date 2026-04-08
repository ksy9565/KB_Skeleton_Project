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
      <p class="panel-label">월간 기록</p>
      <button type="button">최근 4개월</button>
    </div>

    <div
      class="chart-area bar-chart monthly-chart"
      aria-label="수입 지출 월간 막대 그래프"
    >
      <div v-for="month in items" :key="month.label" class="bar-group">
        <div class="bar-stack">
          <span
            class="bar income"
            :style="{ height: `${month.income}%` }"
          ></span>
          <span
            class="bar expense"
            :style="{ height: `${month.expense}%` }"
          ></span>
        </div>
        <span class="bar-label">{{ month.label }}</span>
      </div>
    </div>

    <div class="chart-legend">
      <span><i class="legend-dot income"></i>수입</span>
      <span><i class="legend-dot expense"></i>지출</span>
    </div>
  </article>
</template>
