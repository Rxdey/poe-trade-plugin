<template>
    <section class="ptp-page">
        <div class="ptp-section-heading">
            <span>当前搜索固定商品</span>
            <button v-if="pinnedStore.items.length" type="button" class="ptp-text-button is-danger" @click="clearPinned">
                全部取消
            </button>
        </div>
        <div v-if="pinnedStore.items.length" class="ptp-pinned-list">
            <PinnedItemCard
                v-for="item in sortedItems"
                :key="item.id"
                :item="item"
                @locate="locateItem"
                @unpin="pinnedStore.unpin"
            />
        </div>
        <div v-else class="ptp-empty-state">
            <span class="i-mdi-pin-outline"></span>
            <p>在搜索结果上点击“固定商品”进行对比</p>
        </div>
        <p class="ptp-warning-note">固定商品只在当前搜索中保留，切换搜索或刷新页面后会清空。</p>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { tradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import { usePinnedItemsStore } from '@/stores/pinned-items-store';
import { useUiStore } from '@/stores/ui-store';
import PinnedItemCard from './components/PinnedItemCard/index.vue';

const pinnedStore = usePinnedItemsStore();
const uiStore = useUiStore();
const sortedItems = computed(() =>
    [...pinnedStore.items].sort((a, b) => new Date(a.pinnedAt).getTime() - new Date(b.pinnedAt).getTime())
);

const locateItem = (id: string): void => {
    const row = tradeSiteAdapter.findResultRow(id);
    if (!row) {
        uiStore.notify('原商品已不在当前结果中', 'warning');
        return;
    }
    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    window.setTimeout(() => row.classList.add('ptp-pinned-glow'), 250);
    window.setTimeout(() => row.classList.remove('ptp-pinned-glow'), 2250);
};

const clearPinned = async (): Promise<void> => {
    if (!(await uiStore.confirm('确定取消全部固定商品吗？'))) return;
    pinnedStore.clear();
};
</script>
