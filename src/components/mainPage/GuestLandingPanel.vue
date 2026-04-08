<script setup>
defineProps({
  frontendStack: {
    type: Array,
    required: true,
  },
  backendStack: {
    type: Array,
    required: true,
  },
  featureCards: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="guest-shell">
    <section class="hero-panel">
      <p class="eyebrow">Online Household Ledger</p>
      <h1>로그인 전에도 서비스의 흐름을 바로 이해할 수 있는 시작 화면</h1>
      <p class="hero-description">
        디자인 템플릿과 사용 기술 스택, 기능 명세서를 반영해 메인 진입 페이지를
        구성했습니다. 이후 컴포넌트는 카드 단위로 분리하기 쉽게 구조만 먼저
        잡아두었습니다.
      </p>

      <div class="hero-actions">
        <button type="button" class="primary-button">로그인</button>
        <button type="button" class="secondary-button">회원가입</button>
      </div>

      <div class="hero-footnote">
        <div>
          <strong>월간 관리</strong>
          <span>수입과 지출을 한눈에 확인</span>
        </div>
        <div>
          <strong>컴포넌트화</strong>
          <span>각 영역을 독립 모듈로 분리</span>
        </div>
        <div>
          <strong>JSON 서버</strong>
          <span>백엔드 목업 API 연결 준비</span>
        </div>
      </div>
    </section>

    <section class="info-panel">
      <article class="stack-card">
        <div class="card-header">
          <p class="card-label">사용 기술 스택(필수)</p>
          <strong>프론트엔드</strong>
        </div>

        <div class="stack-list">
          <span v-for="item in frontendStack" :key="item">{{ item }}</span>
        </div>
      </article>

      <article class="stack-card backend-card">
        <div class="card-header">
          <p class="card-label">백엔드</p>
          <strong>json server</strong>
        </div>

        <div class="stack-list compact">
          <span v-for="item in backendStack" :key="item">{{ item }}</span>
        </div>
      </article>

      <article class="feature-card">
        <div class="card-header">
          <p class="card-label">핵심 기능 명세</p>
          <strong>가계부 기능 구성</strong>
        </div>

        <div class="feature-list">
          <div
            v-for="feature in featureCards"
            :key="feature.title"
            class="feature-item"
          >
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
