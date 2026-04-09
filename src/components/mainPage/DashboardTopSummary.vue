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
        <p class="section-label"></p>
        <h1>{{ title }}</h1>
      </div>
    </div>

    <section class="summary-grid">
      <article
        v-for="card in summaryCards"
        :key="card.title"
        class="summary-card"
        :class="card"
      >
        <p>{{ card.title }}</p>
        <strong>{{ card.value }}</strong>
      </article>
    </section>
  </header>
</template>
