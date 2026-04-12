import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBaseStore = defineStore('base', () => {
  const categoryPalette = [
    '#AFCBEA',
    '#F8C999',
    '#F4B0B0',
    '#BFE5DF',
    '#B9E2B0',
    '#F7E7A6',
    '#DABDE8',
    '#F7C6D0',
    '#D9C3B1',
    '#D8DADF',
    '#D8E6A6',
    '#B4E6EB',
    '#B8D2F2',
    '#F7D1A7',
    '#CDEACC',
    '#F3B8B1',
  ];

  const categories = ref([
    {
      id: 1,
      name: '급여',
      color: '#AFCBEA',
    },

    {
      id: 2,
      name: '상여',
      color: '#F8C999',
    },

    {
      id: 3,
      name: '용돈',
      color: '#F4B0B0',
    },

    {
      id: 4,
      name: '부동산',
      color: '#BFE5DF',
    },

    {
      id: 5,
      name: '금융',
      color: '#B9E2B0',
    },

    {
      id: 6,
      name: '기타',
      color: '#F7E7A6',
    },

    {
      id: 7,
      name: '식비',
      color: '#DABDE8',
    },

    {
      id: 8,
      name: '패션/쇼핑',
      color: '#F7C6D0',
    },

    {
      id: 9,
      name: '뷰티/미용',
      color: '#D9C3B1',
    },

    {
      id: 10,
      name: '교통',
      color: '#D8DADF',
    },

    {
      id: 11,
      name: '주거/통신',
      color: '#D8E6A6',
    },

    {
      id: 12,
      name: '의료/건강',
      color: '#B4E6EB',
    },

    {
      id: 13,
      name: '문화/여행',
      color: '#B8D2F2',
    },

    {
      id: 14,
      name: '경조/선물',
      color: '#F7D1A7',
    },

    {
      id: 15,
      name: '반려동물',
      color: '#CDEACC',
    },

    {
      id: 16,
      name: '기타',
      color: '#F3B8B1',
    },
  ]);

  const paymentMethods = ref([
    { name: '신용카드', color: '#AFCBEA' },
    { name: '체크카드', color: '#F8C999' },
    { name: '교통카드', color: '#B9E2B0' },
    { name: '현금', color: '#D8DADF' },
    { name: '계좌이체', color: '#F4B0B0' },

    { name: '환불', color: '#BFE5DF' },
    { name: '포인트적립/캐시백', color: '#DABDE8' },
  ]);

  // ID로 이름을 찾아주는 Getter 함수들
  const getCategoryName = (id) =>
    categories.value.find((c) => c.id === id)?.name;

  const getCategoryColor = (key) => {
    const normalizedKey = typeof key === 'string' ? key.trim() : key;

    const byId = categories.value.find((c) => c.id === Number(normalizedKey));
    if (byId?.color) return byId.color;

    const byName = categories.value.find((c) => c.name === normalizedKey);
    if (byName?.color) return byName.color;

    return categoryPalette[0];
  };

  const mergeCategoriesWithColors = (incomingCategories = []) => {
    if (!Array.isArray(incomingCategories) || incomingCategories.length === 0) {
      return;
    }

    const previous = categories.value;
    categories.value = incomingCategories.map((incoming, index) => {
      const matchById = previous.find((c) => c.id === Number(incoming.id));
      const fallbackColor = categoryPalette[index % categoryPalette.length];

      return {
        ...incoming,
        id: Number(incoming.id),
        color: incoming.color || matchById?.color || fallbackColor,
      };
    });
  };

  const getPaymentMethodsColor = (name) =>
    paymentMethods.value.find((c) => c.name === name)?.color ||
    categoryPalette[0];

  return {
    categoryPalette,
    categories,
    paymentMethods,
    getCategoryName,
    getCategoryColor,
    mergeCategoriesWithColors,
    getPaymentMethodsColor,
  };
});
