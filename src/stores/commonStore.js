import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBaseStore = defineStore('base', () => {
  const categories = ref([
    {
      id: 1,
      name: '급여',
      color: '#4e79a7',
    },

    {
      id: 2,
      name: '상여',
      color: '#f28e2c',
    },

    {
      id: 3,
      name: '용돈',
      color: '#e15759',
    },

    {
      id: 4,
      name: '부동산',
      color: '#76b7b2',
    },

    {
      id: 5,
      name: '금융',
      color: '#59a14f',
    },

    {
      id: 6,
      name: '기타',
      color: '#edc949',
    },

    {
      id: 7,
      name: '식비',
      color: '#af7aa1',
    },

    {
      id: 8,
      name: '패션/쇼핑',
      color: '#ff9da7',
    },

    {
      id: 9,
      name: '뷰티/미용',
      color: '#9c755f',
    },

    {
      id: 10,
      name: '교통',
      color: '#bab0ab',
    },

    {
      id: 11,
      name: '주거/통신',
      color: '#86bc25',
    },

    {
      id: 12,
      name: '의료/건강',
      color: '#00adc6',
    },

    {
      id: 13,
      name: '문화/여행',
      color: '#0047bb',
    },

    {
      id: 14,
      name: '경조/선물',
      color: '#bc4077',
    },

    {
      id: 15,
      name: '반려동물',
      color: '#633d8a',
    },

    {
      id: 16,
      name: '기타',
      color: '#d6616b',
    },
  ]);

  const paymentMethods = ref([
    { id: 1, userId: 1, name: '체크카드' },
    { id: 2, userId: 1, name: '현금' },
    { id: 3, userId: 1, name: '신용카드' },
  ]);

  // ID로 이름을 찾아주는 Getter 함수들
  const getCategoryName = (id) =>
    categories.value.find((c) => c.id === id)?.name;

  const getPaymentMethodsName = (id) =>
    paymentMethods.value.find((c) => c.id === id)?.name;

  return { categories, paymentMethods, getCategoryName, getPaymentMethodsName };
});
