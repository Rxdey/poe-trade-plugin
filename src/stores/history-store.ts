import { defineStore } from 'pinia';
import { ref } from 'vue';
import { pluginRepository } from '@/data';
import {
    failureResult,
    successResult,
    type HistoryEntry,
    type OperationResult,
    type SearchLocation,
} from '@/types';

const MAX_HISTORY_LENGTH = 50;

export const useHistoryStore = defineStore('history', () => {
    const entries = ref<HistoryEntry[]>([]);

    const initialize = async (): Promise<OperationResult> => {
        try {
            entries.value = await pluginRepository.getHistory();
            return successResult(undefined);
        } catch (error) {
            return failureResult(error, '加载历史记录失败');
        }
    };

    const record = async (location: SearchLocation, title: string): Promise<OperationResult> => {
        try {
            const latest = entries.value[0];
            if (latest?.league === location.league && latest.slug === location.slug) {
                return successResult(undefined);
            }
            const nextEntry: HistoryEntry = {
                id: crypto.randomUUID(),
                title,
                league: location.league,
                slug: location.slug,
                visitedAt: new Date().toISOString(),
            };
            const nextEntries = [nextEntry, ...entries.value].slice(0, MAX_HISTORY_LENGTH);
            await pluginRepository.saveHistory(nextEntries);
            entries.value = nextEntries;
            return successResult(undefined);
        } catch (error) {
            return failureResult(error, '记录搜索历史失败');
        }
    };

    const clear = async (): Promise<OperationResult> => {
        try {
            await pluginRepository.clearHistory();
            entries.value = [];
            return successResult(undefined);
        } catch (error) {
            return failureResult(error, '清空历史记录失败');
        }
    };

    return { entries, initialize, record, clear };
});
