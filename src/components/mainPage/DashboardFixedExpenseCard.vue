<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <article class="panel fixed-expense-panel">
    <div class="panel-head">
      <p class="panel-label">고정 지출</p>
      <button type="button">관리</button>
    </div>

    <div class="fixed-expense-list">
      <div v-for="item in items" :key="item.label" class="fixed-expense-row">
        <div>
          <strong>{{ item.label }}</strong>
          <p>{{ item.helper }}</p>
        </div>
        <div class="fixed-expense-value">
          <span>{{ item.value }}</span>
          <strong>{{ item.amount }}</strong>
        </div>
      </div>
    </div>
  </article>
</template>
