<script setup>
defineProps({
  groups: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <aside class="dashboard-sidebar">
    <div class="brand-card">
      <p class="brand-eyebrow">이름</p>
      <h2>사용자님</h2>
      <p>개인 가계부를 한 화면에서 관리합니다.</p>
    </div>

    <section v-for="group in groups" :key="group.title" class="sidebar-group">
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
</template>
