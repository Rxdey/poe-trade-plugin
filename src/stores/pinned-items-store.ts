import { defineStore } from 'pinia';
import { markRaw, shallowRef, ref } from 'vue';
import type { PinnedItem, PinnedSnapshot } from '@/types';

export const usePinnedItemsStore = defineStore('pinned-items', () => {
    const items = shallowRef<PinnedItem[]>([]);
    const revision = ref(0);

    const has = (id: string): boolean => items.value.some(item => item.id === id);

    const toggle = (snapshot: PinnedSnapshot): boolean => {
        if (has(snapshot.id)) {
            unpin(snapshot.id);
            return false;
        }
        items.value = [
            ...items.value,
            {
                ...snapshot,
                detailsElement: markRaw(snapshot.detailsElement),
                renderedItemElement: markRaw(snapshot.renderedItemElement),
                pricingElement: markRaw(snapshot.pricingElement),
                pinnedAt: new Date().toISOString(),
            },
        ];
        revision.value += 1;
        return true;
    };

    const unpin = (id: string): void => {
        items.value = items.value.filter(item => item.id !== id);
        revision.value += 1;
    };

    const clear = (): void => {
        if (!items.value.length) return;
        items.value = [];
        revision.value += 1;
    };

    return { items, revision, has, toggle, unpin, clear };
});
