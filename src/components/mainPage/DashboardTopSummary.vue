<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  balanceLabel: {
    type: String,
    required: true,
  },
  balanceValue: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  summaryCards: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <header class="page-top-summary">
    <div class="page-header">
      <div>
        <p class="section-label">대시보드</p>
        <h1>{{ title }}</h1>
        <p class="section-description">{{ description }}</p>
      </div>

      <div class="header-summary">
        <span>{{ month }}</span>
        <strong>{{ balanceLabel }} : {{ balanceValue }}</strong>
      </div>
    </div>

    <section class="summary-grid">
      <article
        v-for="card in summaryCards"
        :key="card.title"
        class="summary-card"
        :class="card.tone"
      >
        <p>{{ card.title }}</p>
        <strong>{{ card.value }}</strong>
        <span>{{ card.change }}</span>
      </article>
    </section>
  </header>
</template>
