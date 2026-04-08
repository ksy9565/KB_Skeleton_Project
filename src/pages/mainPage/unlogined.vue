<script setup>
import GuestLandingPanel from '@/components/mainPage/GuestLandingPanel.vue';

import '@/styles/mainPage/unlogined.css';

const frontendStack = [
  'Vite project',
  'Composition API 또는 Options API',
  'vue-router',
  'axios',
  'components',
  'pinia',
  '이벤트',
];

const backendStack = ['json server', 'db server 역할'];

const featureCards = [
  {
    title: '가계부 내역 조회',
    description: '월별 수입·지출 내역을 리스트와 캘린더에서 동시에 확인합니다.',
  },
  {
    title: '내역 추가 및 삭제',
    description: 'Form 입력으로 데이터를 생성하고 필요 시 삭제까지 처리합니다.',
  },
  {
    title: '필터링 기능',
    description:
      '수입, 지출, 카테고리별 조건을 선택적으로 보여주는 구조입니다.',
  },
  {
    title: '통계 요약',
    description: '총 수입, 총 지출, 잔액을 카드와 차트로 요약해 보여줍니다.',
  },
];
</script>

<template>
  <GuestLandingPanel
    :frontend-stack="frontendStack"
    :backend-stack="backendStack"
    :feature-cards="featureCards"
  />
</template>
