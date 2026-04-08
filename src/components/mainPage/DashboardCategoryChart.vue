<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const pieGradient = `conic-gradient(${props.items
  .map((item, index) => {
    const start = props.items
      .slice(0, index)
      .reduce((total, current) => total + current.value, 0);
    const end = start + item.value;

    return `${item.color} ${start}% ${end}%`;
  })
  .join(', ')})`;
</script>

<template>
  <article class="panel chart-panel">
    <div class="panel-head">
      <p class="panel-label">카테고리별 지출</p>
      <button type="button">이번 달</button>
    </div>

    <div class="chart-area pie-layout">
      <div class="pie-chart" :style="{ background: pieGradient }"></div>

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
