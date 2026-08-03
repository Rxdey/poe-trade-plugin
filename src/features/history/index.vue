<template>
    <section class="ptp-page">
        <div class="ptp-section-heading">
            <span>最近搜索</span>
            <button v-if="historyStore.entries.length" type="button" class="ptp-text-button is-danger" @click="clearHistory">
                清空全部
            </button>
        </div>
        <div v-if="historyStore.entries.length" class="ptp-history-list">
            <a
                v-for="entry in historyStore.entries"
                :key="entry.id"
                class="ptp-history-item"
                :href="tradeSiteAdapter.buildSearchUrl(entry)"
                target="_blank"
                rel="noopener"
            >
                <strong>{{ entry.title }}</strong>
                <div class="ptp-history-meta">
                    <span class="ptp-history-league">{{ entry.league }}</span>
                    <span class="ptp-history-slug">{{ entry.slug }}</span>
                </div>
                <time :datetime="entry.visitedAt">
                    <span class="i-mdi-clock-outline"></span>
                    {{ formatDate(entry.visitedAt) }}
                </time>
            </a>
        </div>
        <div v-else class="ptp-empty-state">
            <span class="i-mdi-history"></span>
            <p>访问过的搜索会自动显示在这里</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { tradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import { useHistoryStore } from '@/stores/history-store';
import { useUiStore } from '@/stores/ui-store';

const historyStore = useHistoryStore();
const uiStore = useUiStore();

const formatDate = (value: string): string => new Date(value).toLocaleString('zh-CN', { hour12: false });

const clearHistory = async (): Promise<void> => {
    if (!(await uiStore.confirm('确定清空全部搜索历史吗？'))) return;
    const result = await historyStore.clear();
    uiStore.notify(result.success ? '历史记录已清空' : result.error, result.success ? 'success' : 'error');
};
</script>
