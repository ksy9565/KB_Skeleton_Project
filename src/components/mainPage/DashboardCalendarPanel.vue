<script setup>
import { ref, computed } from 'vue';

const currentDate = ref(new Date());

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());

const prevMonth = () => {
  currentDate.value = new Date(year.value, month.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(year.value, month.value + 1, 1);
};

// 달력 생성
const calendarDays = computed(() => {
  const firstDayOfMonth = new Date(year.value, month.value, 1).getDay(); // 1일의 요일 (0:일 ~ 6:토)
  const lastDateOfMonth = new Date(year.value, month.value + 1, 0).getDate(); // 이번 달 마지막 날짜 (28~31)
  
  const days = [];
  let currentWeek = [];

  // 1일 앞의 빈 칸 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }

  // 1일부터 마지막 날까지 채우기
  for (let date = 1; date <= lastDateOfMonth; date++) {
    currentWeek.push(date);
    
    // 토요일(6)이 되면 한 주를 마감하고 새 주 시작
    if (currentWeek.length === 7) {
      days.push(currentWeek);
      currentWeek = [];
    }
  }

  // 마지막 주 남은 빈 칸 채우기
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    days.push(currentWeek);
  }

  return days;
});
</script>

<template>
  <!-- <article class="panel calendar-panel">
    <div class="panel-head">
      <p class="panel-label">캘린더</p>
      <button type="button">월 보기</button>
    </div>

    <div class="calendar-copy">
      <strong>달력</strong>
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
  </article> -->
  <article class="panel calendar-panel">
    <div class="calendar-header">
      <div class="month-selector">
        <button type="button" class="nav-btn" @click="prevMonth">
          <i class="prev-icon">&lt;</i> </button>
        
        <h3 class="current-month">{{ year }}년 {{ month + 1 }}월</h3>
        
        <button type="button" class="nav-btn" @click="nextMonth">
          <i class="next-icon">&gt;</i>
        </button>
      </div>
    </div>

    <div class="calendar-grid" aria-label="월간 캘린더">
      <div class="calendar-weekdays">
        <span class="sun">일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span class="sat">토</span>
      </div>

      <div
        v-for="(week, weekIndex) in calendarDays"
        :key="weekIndex"
        class="calendar-week"
      >
        <span
          v-for="(day, dayIndex) in week"
          :key="`${weekIndex}-${dayIndex}`"
          class="calendar-day"
          :class="{ 
            empty: !day, 
            active: day,
            'sun-text': dayIndex === 0 && day,
            'sat-text': dayIndex === 6 && day 
          }"
        >
          {{ day || '' }}
        </span>
      </div>
    </div>
  </article>
</template>
