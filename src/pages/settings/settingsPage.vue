<script setup>
import DashboardSidebar from '@/components/mainPage/DashboardSidebar.vue';

const navigationGroups = [
  {
    title: '계정',
    items: ['대시보드', '가계부', '통계', '카드 관리'],
  },
  {
    title: '설정',
    items: ['예산 설정', '카테고리 설정', '알림 설정'],
  },
];
</script>

<template>
  <main class="simple-page">
    <DashboardSidebar :groups="navigationGroups" />

    <div class="simple-content">
      <section class="simple-card">
        <p class="simple-eyebrow">Settings</p>
        <h1>settings page</h1>
        <p>설정 페이지가 아직 구성되지 않았습니다.</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.simple-page {
  min-height: 100vh;
  position: relative;
  padding: 24px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), #faf7ff 60%);
}

.simple-content {
  min-height: calc(100vh - 48px);
  display: grid;
  place-items: center;
}

.simple-card {
  width: min(100%, 420px);
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 24px 50px rgba(95, 72, 155, 0.1);
}

.simple-eyebrow {
  margin: 0 0 10px;
  color: #7c3aed;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.simple-card h1 {
  margin: 0 0 10px;
  color: #172033;
}

.simple-card p {
  margin: 0;
  color: #5b6475;
}
</style>
