import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { SearchLocation } from '@/types';

export const useTradeStore = defineStore('trade', () => {
    const currentLocation = ref<SearchLocation | null>(null);
    const recommendedTitle = ref('');
    const hasSearch = computed(() => Boolean(currentLocation.value?.league && currentLocation.value?.slug));

    const setCurrentSearch = (location: SearchLocation | null, title: string): void => {
        currentLocation.value = location;
        recommendedTitle.value = title;
    };

    return { currentLocation, recommendedTitle, hasSearch, setCurrentSearch };
});
