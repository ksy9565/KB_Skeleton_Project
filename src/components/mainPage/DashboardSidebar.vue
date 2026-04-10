<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  groups: {
    type: Array,
    required: true,
  },
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);
const isMobile = ref(false);
const sidebarItems = [
  {
    key: 'home',
    label: '홈으로',
    icon: 'fa-solid fa-house',
    routeName: 'main',
  },
  {
    key: 'ledger',
    label: '가계부',
    icon: 'fa-solid fa-calendar',
    routeName: 'ledger',
  },
  {
    key: 'analysis',
    label: '분석',
    icon: 'fa-solid fa-chart-column',
    routeName: 'analysis',
  },
  {
    key: 'settings',
    label: '설정',
    icon: 'fa-solid fa-gear',
    routeName: 'settings',
  },
];

const isDisabledItem = (item) =>
  !authStore.isAuthenticated && item.key !== 'home';

const navigateToItem = async (item) => {
  if (isDisabledItem(item)) {
    return;
  }

  if (
    item.key === 'home' ||
    item.key === 'ledger' ||
    item.key === 'analysis' ||
    item.key === 'settings'
  ) {
    await router.push({ name: item.routeName });
    closeMenu();
  }
};

const isActiveItem = (item) => route.name === item.routeName;

const handleLogout = () => {
  if (!authStore.isAuthenticated) {
    window.alert('로그인을 먼저 해주세요!');
    return;
  }

  authStore.logout();
  router.push({ name: 'login' });
  closeMenu();
};

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

const handleLogin = () => {
  if (authStore.isAuthenticated) {
    return;
  }

  router.push({ name: 'login' });
  closeMenu();
};

const getDisplayName = () =>
  authStore.currentUser?.name || authStore.currentUser?.username || '';

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
      <i class="fa-solid fa-bars"></i>
    </button>

    <aside
      v-if="!isMobile"
      class="dashboard-sidebar dashboard-sidebar--desktop"
    >
      <button
        type="button"
        class="login-button"
        :class="{ 'is-disabled': authStore.isAuthenticated }"
        :disabled="authStore.isAuthenticated"
        @click="handleLogin"
      >
        <i class="fa-solid fa-user"></i>
        <span v-if="authStore.isAuthenticated"
          >{{ getDisplayName() }}님 환영합니다</span
        >
        <span v-else>로그인</span>
      </button>

      <nav class="sidebar-nav" aria-label="사이드바 메뉴">
        <button
          v-for="item in sidebarItems"
          :key="item.key"
          type="button"
          class="sidebar-link"
          :class="{
            'is-active': isActiveItem(item),
            'is-disabled': isDisabledItem(item),
          }"
          :disabled="isDisabledItem(item)"
          @click="navigateToItem(item)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </button>

        <button
          type="button"
          class="sidebar-link sidebar-link--danger"
          :class="{ 'is-disabled': !authStore.isAuthenticated }"
          :disabled="!authStore.isAuthenticated"
          @click="handleLogout"
        >
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          <span>로그아웃</span>
        </button>
      </nav>
    </aside>

    <transition name="sidebar-fade">
      <div
        v-if="isMobile && mobileMenuOpen"
        class="sidebar-modal"
        @click.self="closeMenu"
      >
        <aside class="dashboard-sidebar dashboard-sidebar--mobile">
          <div class="sidebar-mobile-header">
            <button
              type="button"
              class="login-button"
              :class="{ 'is-disabled': authStore.isAuthenticated }"
              :disabled="authStore.isAuthenticated"
              @click="handleLogin"
            >
              <i class="fa-solid fa-user"></i>
              <span v-if="authStore.isAuthenticated"
                >{{ getDisplayName() }}님 환영합니다</span
              >
              <span v-else>로그인</span>
            </button>

            <button
              type="button"
              class="sidebar-close"
              aria-label="메뉴 닫기"
              @click="closeMenu"
            >
              ×
            </button>
          </div>

          <nav class="sidebar-nav" aria-label="사이드바 메뉴">
            <button
              v-for="item in sidebarItems"
              :key="item.key"
              type="button"
              class="sidebar-link"
              :class="{
                'is-active': isActiveItem(item),
                'is-disabled': isDisabledItem(item),
              }"
              :disabled="isDisabledItem(item)"
              @click="navigateToItem(item)"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </button>

            <button
              type="button"
              class="sidebar-link sidebar-link--danger"
              :class="{ 'is-disabled': !authStore.isAuthenticated }"
              :disabled="!authStore.isAuthenticated"
              @click="handleLogout"
            >
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <span>로그아웃</span>
            </button>
          </nav>
        </aside>
      </div>
    </transition>
  </div>
</template>
