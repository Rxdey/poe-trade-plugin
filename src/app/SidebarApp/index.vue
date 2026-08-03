<template>
    <button v-if="uiStore.collapsed" type="button" class="ptp-expand-handle" title="展开交易助手" @click="toggleSidebar">
        <span class="i-mdi-chevron-left"></span>
        <span class="i-mdi-bookmark-multiple"></span>
    </button>

    <aside v-else class="ptp-sidebar" :class="{ 'is-resizing': resizing }">
        <div
            class="ptp-resize-handle"
            role="separator"
            aria-label="调整侧栏宽度"
            aria-orientation="vertical"
            :aria-valuenow="sidebarWidth"
            :aria-valuemin="MIN_SIDEBAR_WIDTH"
            :aria-valuemax="MAX_SIDEBAR_WIDTH"
            tabindex="0"
            @pointerdown="startResize"
            @keydown.left.prevent="resizeBy(16)"
            @keydown.right.prevent="resizeBy(-16)"
        ></div>
        <header class="ptp-sidebar-header">
            <div>
                <strong>POE 交易助手</strong>
                <small>3.0</small>
            </div>
            <button type="button" class="ptp-icon-button" title="折叠侧栏" @click="toggleSidebar">
                <span class="i-mdi-chevron-right"></span>
            </button>
        </header>

        <nav class="ptp-tabs" aria-label="交易助手功能">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                :class="{ 'is-active': uiStore.activeTab === tab.id }"
                @click="uiStore.setActiveTab(tab.id)"
            >
                <span :class="tab.icon"></span>
                <span>{{ tab.label }}</span>
                <span v-if="tab.id === 'pinned-items' && pinnedStore.items.length" class="ptp-tab-count">
                    {{ pinnedStore.items.length }}
                </span>
            </button>
        </nav>

        <main class="ptp-sidebar-content">
            <BookmarksPage v-if="uiStore.activeTab === 'bookmarks'" />
            <HistoryPage v-else-if="uiStore.activeTab === 'history'" />
            <PinnedItemsPage v-else />
        </main>
    </aside>

    <TransitionGroup name="ptp-toast" tag="div" class="ptp-toast-stack">
        <div v-for="notice in uiStore.notices" :key="notice.id" class="ptp-toast" :class="`is-${notice.type}`">
            {{ notice.message }}
        </div>
    </TransitionGroup>

    <AppModal :model-value="Boolean(uiStore.confirmRequest)" title="请确认" @update:model-value="cancelConfirm">
        <p class="ptp-confirm-message">{{ uiStore.confirmRequest?.message }}</p>
        <template #footer>
            <AppButton label="取消" variant="ghost" @click="uiStore.resolveConfirm(false)" />
            <AppButton label="确认" variant="danger" @click="uiStore.resolveConfirm(true)" />
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import AppButton from '@/components/AppButton/index.vue';
import AppModal from '@/components/AppModal/index.vue';
import BookmarksPage from '@/features/bookmarks/index.vue';
import HistoryPage from '@/features/history/index.vue';
import PinnedItemsPage from '@/features/pinned-items/index.vue';
import { tradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import { useResizablePanel } from '@/composables/use-resizable-panel';
import { usePinnedItemsStore } from '@/stores/pinned-items-store';
import { useUiStore } from '@/stores/ui-store';
import type { AppTab } from '@/types';

const uiStore = useUiStore();
const pinnedStore = usePinnedItemsStore();
const { sidebarWidth } = storeToRefs(uiStore);
const MIN_SIDEBAR_WIDTH = 340;
const MAX_SIDEBAR_WIDTH = 720;
const tabs: Array<{ id: AppTab; label: string; icon: string }> = [
    { id: 'bookmarks', label: '收藏', icon: 'i-mdi-folder-star' },
    { id: 'history', label: '历史', icon: 'i-mdi-history' },
    { id: 'pinned-items', label: '固定商品', icon: 'i-mdi-pin' },
];

watch(
    () => uiStore.expanded,
    expanded => tradeSiteAdapter.setSidebarExpanded(expanded),
    { immediate: true }
);

watch(
    sidebarWidth,
    width => tradeSiteAdapter.setSidebarWidth(width),
    { immediate: true }
);

const { resizing, startResize, resizeBy } = useResizablePanel({
    width: sidebarWidth,
    minWidth: MIN_SIDEBAR_WIDTH,
    maxWidth: MAX_SIDEBAR_WIDTH,
    onResizeEnd: async width => {
        await uiStore.saveSidebarWidth(width);
    },
});

const toggleSidebar = (): void => void uiStore.toggleCollapsed();
const cancelConfirm = (visible: boolean): void => {
    if (!visible) uiStore.resolveConfirm(false);
};
</script>
