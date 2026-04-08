<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <article class="panel recent-panel">
    <div class="panel-head">
      <p class="panel-label">최근 거래 내역</p>
      <button type="button">상세</button>
    </div>

    <ul class="transaction-list">
      <li
        v-for="item in items"
        :key="`${item.title}-${item.date}`"
        class="transaction-item"
      >
        <div class="transaction-meta">
          <span
            :class="[
              'transaction-badge',
              item.type === '수입' ? 'positive' : 'negative',
            ]"
          >
            {{ item.type }}
          </span>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.date }}</p>
          </div>
        </div>
        <strong
          class="transaction-amount"
          :class="item.type === '수입' ? 'positive' : 'negative'"
        >
          {{ item.amount }}
        </strong>
      </li>
    </ul>
  </article>
</template>
