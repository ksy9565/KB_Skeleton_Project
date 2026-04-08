<script setup>
defineProps({
  days: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <article class="panel calendar-panel">
    <div class="panel-head">
      <p class="panel-label">캘린더</p>
      <button type="button">월 보기</button>
    </div>

    <div class="calendar-copy">
      <strong>달력</strong>
      <p>지출 패턴을 날짜 단위로 확인합니다.</p>
    </div>

    <div class="calendar-grid" aria-label="월간 캘린더">
      <div class="calendar-weekdays">
        <span>일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span>토</span>
      </div>

      <div
        v-for="(week, weekIndex) in days"
        :key="weekIndex"
        class="calendar-week"
      >
        <span
          v-for="day in week"
          :key="`${weekIndex}-${day || 'empty'}`"
          class="calendar-day"
          :class="{ empty: !day, active: day === '23' || day === '24' }"
        >
          {{ day }}
        </span>
      </div>
    </div>
  </article>
</template>
