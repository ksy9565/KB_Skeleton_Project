<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  groups: {
    type: Array,
    required: true,
  },
});

const mobileMenuOpen = ref(false);
const isMobile = ref(false);

const syncViewport = () => {
  isMobile.value = window.innerWidth <= 1180;

  if (!isMobile.value) {
    mobileMenuOpen.value = false;
  }
};

const openMenu = () => {
  mobileMenuOpen.value = true;
};

const closeMenu = () => {
  mobileMenuOpen.value = false;
};

watch(mobileMenuOpen, (isOpen) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.style.overflow = isOpen && isMobile.value ? 'hidden' : '';
});

onMounted(() => {
  syncViewport();
  window.addEventListener('resize', syncViewport);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport);

  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <div class="sidebar-host">
    <button
      v-if="isMobile && !mobileMenuOpen"
      type="button"
      class="sidebar-toggle"
      aria-label="메뉴 열기"
      @click="openMenu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <aside
      v-if="!isMobile"
      class="dashboard-sidebar dashboard-sidebar--desktop"
    >
      <div class="brand-card">
        <p class="brand-eyebrow">이름</p>
        <h2>사용자님</h2>
        <p>개인 가계부를 한 화면에서 관리합니다.</p>
      </div>

      <section
        v-for="group in props.groups"
        :key="group.title"
        class="sidebar-group"
      >
        <h3>{{ group.title }}</h3>
        <ul>
          <li v-for="item in group.items" :key="item">
            <button type="button">{{ item }}</button>
          </li>
        </ul>
      </section>

      <div class="sidebar-footer">
        <button type="button" class="ghost-button">로그아웃</button>
      </div>
    </aside>

    <transition name="sidebar-fade">
      <div
        v-if="isMobile && mobileMenuOpen"
        class="sidebar-modal"
        @click.self="closeMenu"
      >
        <aside class="dashboard-sidebar dashboard-sidebar--mobile">
          <div class="sidebar-mobile-header">
            <div class="brand-card brand-card--compact">
              <p class="brand-eyebrow">이름</p>
              <h2>사용자님</h2>
              <p>개인 가계부를 한 화면에서 관리합니다.</p>
            </div>

            <button
              type="button"
              class="sidebar-close"
              aria-label="메뉴 닫기"
              @click="closeMenu"
            >
              ×
            </button>
          </div>

          <section
            v-for="group in props.groups"
            :key="group.title"
            class="sidebar-group"
          >
            <h3>{{ group.title }}</h3>
            <ul>
              <li v-for="item in group.items" :key="item">
                <button type="button">{{ item }}</button>
              </li>
            </ul>
          </section>

          <div class="sidebar-footer">
            <button type="button" class="ghost-button">로그아웃</button>
          </div>
        </aside>
      </div>
    </transition>
  </div>
</template>
