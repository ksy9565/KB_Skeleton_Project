<template>
  <div class="app-shell">
    <RouterLink
      :to="{ name: 'main' }"
      class="app-logo-link"
      aria-label="홈으로 이동"
    >
      <img src="@/images/logo.png" alt="logo" class="app-logo-image" />
    </RouterLink>

    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<style scoped>
.app-shell {
  position: relative;
}

.app-logo-link {
  position: fixed;
  left: 44px;
  top: 16px;
  z-index: 35;
  display: inline-flex;
}

.app-logo-image {
  width: 170px;
  height: auto;
  object-fit: contain;
}

@media (max-width: 1180px) {
  .app-logo-link {
    display: none;
  }
}
</style>
