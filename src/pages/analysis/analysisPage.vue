<script setup>
import { computed, watch } from 'vue';
import { Pie } from 'vue-chartjs';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBaseStore } from '@/stores/commonStore';
import DashboardSidebar from '@/components/mainPage/DashboardSidebar.vue';
import DashboardWeeklyChart from '@/components/mainPage/DashboardWeeklyChart.vue';
import DashboardMonthlyChart from '@/components/mainPage/DashboardMonthlyChart.vue';
import DashboardTopSummary from '@/components/mainPage/DashboardTopSummary.vue';
import '@/styles/mainPage/logined.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

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

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const baseStore = useBaseStore();

const { transactions, isLoading } = storeToRefs(transactionStore);
const { categories } = storeToRefs(baseStore);

const loadTransactions = async () => {
  if (!authStore.currentUser?.id) {
    transactions.value = [];
    return;
  }

  await transactionStore.fetchTransactions();
};

watch(
  () => authStore.currentUser?.id,
  async () => {
    await loadTransactions();
  },
  { immediate: true },
);

const sourceTransactions = computed(() => transactions.value || []);

const expenseTransactions = computed(() =>
  sourceTransactions.value.filter((t) => t.type === 'expense'),
);

const incomeTransactions = computed(() =>
  sourceTransactions.value.filter((t) => t.type === 'income'),
);

const totalIncome = computed(() =>
  incomeTransactions.value.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  ),
);

const totalExpense = computed(() =>
  expenseTransactions.value.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  ),
);

const netBalance = computed(() => totalIncome.value - totalExpense.value);

const buildWeeklyStats = (source, weekCount = 5) => {
  const weeklyStats = [];
  const now = new Date();

  for (let i = weekCount - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i * 7);

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const date = targetDate.getDate();
    const weekNumber = Math.ceil(date / 7);

    const filtered = source.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === year &&
        txDate.getMonth() + 1 === month &&
        Math.ceil(txDate.getDate() / 7) === weekNumber
      );
    });

    const income = filtered
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const expense = filtered
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    weeklyStats.push({
      label: `${month}월 ${weekNumber}주`,
      income,
      expense,
      date: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
    });
  }

  return weeklyStats;
};

const buildMonthlyStats = (source, monthCount = 4) => {
  const monthFormatter = new Intl.DateTimeFormat('ko-KR', { month: 'numeric' });
  const monthStats = new Map();
  const now = new Date();

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    monthStats.set(monthKey, {
      label: `${monthFormatter.format(date)}`,
      income: 0,
      expense: 0,
    });
  }

  source.forEach((transaction) => {
    const monthKey = transaction.date.slice(0, 7);
    if (!monthStats.has(monthKey)) return;

    const monthlyStat = monthStats.get(monthKey);

    if (transaction.type === 'income') {
      monthlyStat.income += Number(transaction.amount || 0);
    }

    if (transaction.type === 'expense') {
      monthlyStat.expense += Number(transaction.amount || 0);
    }
  });

  return Array.from(monthStats.values());
};

const weeklyItems = computed(() => transactionStore.getWeeklyStats());
const monthlyItems = computed(() =>
  buildMonthlyStats(sourceTransactions.value, 4),
);

const categoryItems = computed(() => {
  if (totalExpense.value === 0) return [];

  const categoryMap = expenseTransactions.value.reduce((acc, tx) => {
    const categoryKey = tx.categoryId ?? tx.category ?? '미분류';
    acc[categoryKey] = (acc[categoryKey] || 0) + Number(tx.amount || 0);
    return acc;
  }, {});

  return Object.keys(categoryMap)
    .map((catId) => {
      const categoryInfo = categories.value.find(
        (c) => c.id === Number(catId) || c.name === catId,
      );
      const amount = categoryMap[catId];
      const percentage = Number(
        ((amount / totalExpense.value) * 100).toFixed(1),
      );

      return {
        label: categoryInfo?.name || String(catId),
        value: percentage,
        color: baseStore.getCategoryColor(
          categoryInfo?.id ?? categoryInfo?.name ?? catId,
        ),
      };
    })
    .sort((a, b) => b.value - a.value);
});

const paymentItems = computed(() => {
  if (totalExpense.value === 0) return [];

  const methodMap = expenseTransactions.value.reduce((acc, tx) => {
    const methodKey = tx.paymentMethod || '미분류';
    acc[methodKey] = (acc[methodKey] || 0) + Number(tx.amount || 0);
    return acc;
  }, {});

  return Object.keys(methodMap)
    .map((methodName) => {
      const amount = methodMap[methodName];
      const percentage = Number(
        ((amount / totalExpense.value) * 100).toFixed(1),
      );

      return {
        label: methodName,
        value: percentage,
        color: baseStore.getPaymentMethodsColor(methodName) || '#8b5cf6',
      };
    })
    .sort((a, b) => b.value - a.value);
});

const createPieChartData = (items) => ({
  labels: items.map((item) => item.label),
  datasets: [
    {
      data: items.map((item) => item.value),
      backgroundColor: items.map((item) => item.color),
      borderColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 3,
      hoverOffset: 8,
      hoverBorderWidth: 3,
    },
  ],
});

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => ` ${context.label}: ${context.raw}%`,
      },
    },
    datalabels: {
      display: true,
      color: '#1f2937',
      font: { size: 11, weight: '700' },
      textStrokeColor: 'rgba(255, 255, 255, 0.85)',
      textStrokeWidth: 2,
      formatter: (value, context) => {
        const numericValue = Number(value);
        if (numericValue >= 9) {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}\n${numericValue}%`;
        }
        return '';
      },
      textAlign: 'center',
    },
  },
};

const categoryChartData = computed(() =>
  categoryItems.value.length > 0
    ? createPieChartData(categoryItems.value)
    : null,
);

const paymentChartData = computed(() =>
  paymentItems.value.length > 0 ? createPieChartData(paymentItems.value) : null,
);

const topCategory = computed(() => categoryItems.value[0] || null);
const topMethod = computed(() => paymentItems.value[0] || null);

const monthlyTotalsMap = computed(() => {
  return sourceTransactions.value.reduce((acc, tx) => {
    const monthKey = tx.date?.slice(0, 7);
    if (!monthKey) return acc;

    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0 };
    }

    if (tx.type === 'income') {
      acc[monthKey].income += Number(tx.amount || 0);
    }

    if (tx.type === 'expense') {
      acc[monthKey].expense += Number(tx.amount || 0);
    }

    return acc;
  }, {});
});

const getMonthKey = (year, monthIndex) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

const getMonthlyComparison = (targetKey, compareKey) => {
  const target = monthlyTotalsMap.value[targetKey] || { income: 0, expense: 0 };
  const compare = monthlyTotalsMap.value[compareKey] || {
    income: 0,
    expense: 0,
  };

  const incomeDiff = target.income - compare.income;
  const expenseDiff = target.expense - compare.expense;

  return {
    target,
    compare,
    incomeDiff,
    expenseDiff,
  };
};

const currentDate = new Date();
const currentMonthKey = getMonthKey(
  currentDate.getFullYear(),
  currentDate.getMonth(),
);
const previousMonthDate = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 1,
  1,
);
const previousMonthKey = getMonthKey(
  previousMonthDate.getFullYear(),
  previousMonthDate.getMonth(),
);
const lastYearSameMonthDate = new Date(
  currentDate.getFullYear() - 1,
  currentDate.getMonth(),
  1,
);
const lastYearSameMonthKey = getMonthKey(
  lastYearSameMonthDate.getFullYear(),
  lastYearSameMonthDate.getMonth(),
);

const monthOverMonth = computed(() =>
  getMonthlyComparison(currentMonthKey, previousMonthKey),
);

const yearOverYear = computed(() =>
  getMonthlyComparison(currentMonthKey, lastYearSameMonthKey),
);

const formatComparison = (value) => {
  if (value === 0) return '변화 없음';
  const sign = value > 0 ? '+' : '-';
  return `${sign}${Math.abs(value).toLocaleString()}원`;
};

const comparisonDirectionText = (incomeDiff, expenseDiff) => {
  const incomeText = formatComparison(incomeDiff);
  const expenseText = formatComparison(expenseDiff);
  return `수입: ${incomeText}\n지출: ${expenseText}`;
};

const recentWeekExpense = computed(
  () => weeklyItems.value[weeklyItems.value.length - 1]?.expense || 0,
);

const previousWeekExpense = computed(
  () => weeklyItems.value[weeklyItems.value.length - 2]?.expense || 0,
);

const weeklyTrend = computed(() => {
  const diff = recentWeekExpense.value - previousWeekExpense.value;

  if (expenseTransactions.value.length === 0) {
    return '기록된 지출 데이터가 없습니다.';
  }

  if (previousWeekExpense.value === 0 && recentWeekExpense.value > 0) {
    return `최근 1주 지출이 새로 발생했어요. 총 ${recentWeekExpense.value.toLocaleString()}원입니다.`;
  }
  if (diff > 0) {
    return `최근 1주 지출이 지난주보다 ${diff.toLocaleString()}원 증가했습니다.`;
  }
  if (diff < 0) {
    return `최근 1주 지출이 지난주보다 ${Math.abs(diff).toLocaleString()}원 감소했습니다.`;
  }
  return '최근 1주 지출이 지난주와 비슷한 수준입니다.';
});

const monthlyTrend = computed(() => {
  const items = monthlyItems.value;
  if (items.length < 2) return '월간 비교 데이터가 충분하지 않습니다.';

  const latest = items[items.length - 1]?.expense || 0;
  const previous = items[items.length - 2]?.expense || 0;
  const diff = latest - previous;

  if (previous === 0 && latest > 0) {
    return `최근 월 지출이 새로 발생했어요. 총 ${latest.toLocaleString()}원입니다.`;
  }
  if (diff > 0) {
    return `최근 월 지출이 전월보다 ${diff.toLocaleString()}원 증가했습니다.`;
  }
  if (diff < 0) {
    return `최근 월 지출이 전월보다 ${Math.abs(diff).toLocaleString()}원 감소했습니다.`;
  }
  return '최근 월 지출이 전월과 비슷한 수준입니다.';
});

const spendingDiagnosis = computed(() => {
  if (expenseTransactions.value.length === 0) {
    return {
      type: '기록 부족형',
      summary:
        '현재 기록된 지출 데이터가 부족해 소비 성향을 아직 판단하기 어렵습니다.',
      tip: '지출을 조금 더 꾸준히 기록하면 더 정확한 진단이 가능합니다.',
    };
  }

  const categoryShare = topCategory.value?.value || 0;
  const methodShare = topMethod.value?.value || 0;

  if (totalExpense.value > totalIncome.value && totalIncome.value > 0) {
    return {
      type: '지출 우위형',
      summary:
        '기록된 데이터 기준으로 수입보다 지출이 더 많았습니다. 지출 조절이 필요한 구간입니다.',
      tip: '고정 지출과 변동 지출을 분리해서 확인해보세요.',
    };
  }

  if (topMethod.value?.label === '현금' && methodShare >= 50) {
    return {
      type: '현금 관리형',
      summary: '현금 사용 비중이 높아 세부 기록을 직접 챙기는 편입니다.',
      tip: '현금 지출 메모를 함께 남기면 소비 패턴 파악이 쉬워집니다.',
    };
  }

  if (methodShare >= 60 && topMethod.value?.label?.includes('카드')) {
    return {
      type: '카드 중심형',
      summary: '카드 결제 비중이 높아 월간 카드 지출 점검이 중요한 타입입니다.',
      tip: '카드별 소비 항목을 비교하면 불필요한 지출을 줄이기 좋습니다.',
    };
  }

  if (categoryShare >= 40) {
    return {
      type: '집중 소비형',
      summary: `지출이 ${topCategory.value?.label || '특정 카테고리'}에 크게 몰리는 편입니다.`,
      tip: '해당 카테고리에 별도 예산 한도를 두는 것을 추천합니다.',
    };
  }

  return {
    type: '균형 소비형',
    summary: '지출이 여러 항목에 비교적 고르게 분산되어 있습니다.',
    tip: '현재 흐름을 유지하면서 월말 지출만 한 번 더 확인해보세요.',
  };
});

const diagnosisCards = computed(() => [
  {
    title: '지출 집중도',
    value: topCategory.value
      ? `${topCategory.value.label} ${topCategory.value.value}%`
      : '데이터 없음',
    description: topCategory.value
      ? '가장 큰 지출 항목입니다.'
      : '데이터가 없습니다.',
  },
  {
    title: '결제 습관',
    value: topMethod.value
      ? `${topMethod.value.label} ${topMethod.value.value}%`
      : '데이터 없음',
    description: topMethod.value
      ? '가장 많이 쓰는 결제수단입니다.'
      : '데이터가 없습니다.',
  },
  {
    title: '전월 대비',
    value: comparisonDirectionText(
      monthOverMonth.value.incomeDiff,
      monthOverMonth.value.expenseDiff,
    ),
    description: '현재 달과 전월을 비교합니다.',
  },
  {
    title: '작년 동월 대비',
    value: comparisonDirectionText(
      yearOverYear.value.incomeDiff,
      yearOverYear.value.expenseDiff,
    ),
    description: '현재 달과 작년 같은 달을 비교합니다.',
  },
]);

const summaryCards = computed(() => [
  {
    title: '총 수입',
    value: `${totalIncome.value.toLocaleString()}원`,
  },
  {
    title: '총 지출',
    value: `${totalExpense.value.toLocaleString()}원`,
  },
  {
    title: '순수입',
    value: `${netBalance.value.toLocaleString()}원`,
  },
]);
</script>

<template>
  <main
    class="dashboard-shell analysis-page"
    :class="{ 'is-guest': !authStore.isAuthenticated }"
  >
    <DashboardSidebar :groups="navigationGroups" :show-battery="true" />

    <section class="content-area analysis-content">
      <DashboardTopSummary
        title="소비 성향 분석"
        month=""
        balance-label=""
        balance-value=""
        :summary-cards="summaryCards"
      />

      <section class="diagnosis-banner panel">
        <div class="diagnosis-main">
          <p class="panel-label">성향 진단</p>
          <h2>{{ spendingDiagnosis.type }}</h2>
          <p>{{ spendingDiagnosis.summary }}</p>
        </div>
        <div class="diagnosis-tip">
          <strong>한 줄 조언</strong>
          <span>{{ spendingDiagnosis.tip }}</span>
        </div>
      </section>

      <section class="insight-grid">
        <article
          v-for="card in diagnosisCards"
          :key="card.title"
          class="panel insight-card"
        >
          <p class="panel-label">{{ card.title }}</p>
          <h3>{{ card.value }}</h3>
          <p>{{ card.description }}</p>
        </article>
      </section>

      <section class="panel-grid analysis-grid">
        <DashboardWeeklyChart :items="weeklyItems" />
        <DashboardMonthlyChart :items="monthlyItems" />
      </section>

      <section class="panel-grid analysis-grid">
        <article class="panel chart-panel">
          <div class="panel-head">
            <p class="panel-label">카테고리별 지출</p>
          </div>

          <div v-if="categoryChartData" class="chart-area pie-layout">
            <div class="pie-chart-container">
              <Pie :data="categoryChartData" :options="pieOptions" />
            </div>

            <div class="category-legend">
              <div
                v-for="item in categoryItems"
                :key="item.label"
                class="category-row"
              >
                <span
                  class="category-swatch"
                  :style="{ backgroundColor: item.color }"
                ></span>
                <div class="category-info">
                  <strong class="label">{{ item.label }}</strong>
                  <p class="value">{{ item.value }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-data-analysis">
            분석할 지출 데이터가 없습니다.
          </div>
        </article>

        <article class="panel chart-panel">
          <div class="panel-head">
            <p class="panel-label">결제수단별 지출</p>
          </div>

          <div v-if="paymentChartData" class="chart-area pie-layout">
            <div class="pie-chart-container">
              <Pie :data="paymentChartData" :options="pieOptions" />
            </div>

            <div class="category-legend">
              <div
                v-for="item in paymentItems"
                :key="item.label"
                class="category-row"
              >
                <span
                  class="category-swatch"
                  :style="{ backgroundColor: item.color }"
                ></span>
                <div class="category-info">
                  <strong class="label">{{ item.label }}</strong>
                  <p class="value">{{ item.value }}%</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-data-analysis">
            분석할 지출 데이터가 없습니다.
          </div>
        </article>
      </section>

      <section class="panel recommendation-panel">
        <p class="panel-label">추천 관리 포인트</p>
        <ul>
          <li v-if="topCategory">
            {{ topCategory.label }} 비중 {{ topCategory.value }}%.
          </li>
          <li v-if="topMethod">
            {{ topMethod.label }} 결제가 {{ topMethod.value }}%로 가장 많습니다.
          </li>
          <li>
            {{ weeklyTrend }}
          </li>
        </ul>
      </section>
    </section>

    <div v-if="!authStore.isAuthenticated" class="guest-blocker">
      <p>로그인해주세요</p>
      <span>분석 페이지를 보려면 로그인이 필요합니다.</span>
    </div>
  </main>
</template>

<style scoped>
.analysis-page {
  position: relative;
}

.analysis-content {
  display: grid;
  gap: 18px;
}

.diagnosis-banner {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid rgba(130, 120, 170, 0.14);
}

.diagnosis-main h2 {
  margin: 6px 0 10px;
  color: #1f1537;
  font-size: 1.35rem;
}

.diagnosis-main p {
  margin: 0;
  color: rgba(28, 20, 48, 0.72);
  line-height: 1.7;
}

.diagnosis-tip {
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  background: #f5f3ff;
  color: #31204f;
}

.diagnosis-tip strong {
  font-size: 0.95rem;
}

.diagnosis-tip span {
  line-height: 1.6;
}

.insight-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.insight-card {
  padding: 18px 20px;
}

.insight-card h3 {
  margin: 8px 0 10px;
  color: #1f1537;
  font-size: 1rem;
  white-space: pre-line;
  line-height: 1.5;
}

.insight-card p {
  margin: 0;
  color: rgba(28, 20, 48, 0.72);
  line-height: 1.6;
  font-size: 0.92rem;
}

.analysis-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chart-panel,
.recommendation-panel {
  padding: 20px;
}

.chart-panel {
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.16);
}

.recommendation-panel ul {
  margin: 12px 0 0;
  padding-left: 20px;
  color: rgba(28, 20, 48, 0.74);
  line-height: 1.7;
}

.pie-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.pie-chart-container {
  position: relative;
  width: 220px;
  height: 220px;
  filter: drop-shadow(0 14px 24px rgba(148, 163, 184, 0.2));
}

.category-legend {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-swatch {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.95),
    0 2px 8px rgba(148, 163, 184, 0.18);
}

.category-info .label {
  display: block;
  font-size: 14px;
  color: #333;
}

.category-info .value {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.no-data-analysis {
  min-height: 220px;
  display: grid;
  place-items: center;
  color: #31204f;
  font-weight: 700;
}

.guest-blocker {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 40;
  display: grid;
  gap: 10px;
  min-width: 260px;
  padding: 24px 26px;
  border: 1px solid rgba(130, 120, 170, 0.22);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 24px 56px rgba(36, 27, 72, 0.2);
  transform: translate(-50%, -50%);
  text-align: center;
}

.guest-blocker p {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f1537;
}

.guest-blocker span {
  color: rgba(28, 20, 48, 0.72);
  font-size: 0.92rem;
}

@media (max-width: 1200px) {
  .insight-grid,
  .analysis-grid {
    grid-template-columns: 1fr 1fr;
  }

  .diagnosis-banner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .insight-grid,
  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .category-legend {
    grid-template-columns: 1fr;
  }
}
</style>
