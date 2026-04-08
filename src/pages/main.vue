<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import LoginedPage from './mainPage/logined.vue';
import UnloginedPage from './mainPage/unlogined.vue';

const route = useRoute();

const showGuestView = computed(() => route.query.view === 'guest');
</script>

<template>
  <main class="main-shell">
    <LoginedPage v-if="!showGuestView" />
    <UnloginedPage v-else />
  </main>
</template>

<style scoped>
.main-shell {
  min-height: 100vh;
}
</style>
