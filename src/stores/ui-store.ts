import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import { pluginRepository } from '@/data';
import { DEFAULT_SETTINGS } from '@/data/repositories/plugin-repository';
import { failureResult, successResult, type AppTab, type OperationResult } from '@/types';

export type NoticeType = 'success' | 'error' | 'warning';
export interface UiNotice {
    id: string;
    message: string;
    type: NoticeType;
}

interface ConfirmRequest {
    message: string;
    resolve: (confirmed: boolean) => void;
}

export const useUiStore = defineStore('ui', () => {
    const activeTab = ref<AppTab>(DEFAULT_SETTINGS.activeTab);
    const collapsed = ref(DEFAULT_SETTINGS.collapsed);
    const expandedFolderIds = ref<string[]>([]);
    const sidebarWidth = ref(DEFAULT_SETTINGS.sidebarWidth);
    const notices = ref<UiNotice[]>([]);
    const confirmRequest = shallowRef<ConfirmRequest | null>(null);
    const expanded = computed(() => !collapsed.value);

    const initialize = async (): Promise<OperationResult> => {
        try {
            const settings = await pluginRepository.getUiSettings();
            activeTab.value = settings.activeTab;
            collapsed.value = settings.collapsed;
            expandedFolderIds.value = settings.expandedFolderIds;
            sidebarWidth.value = settings.sidebarWidth;
            return successResult(undefined);
        } catch (error) {
            return failureResult(error, '初始化界面设置失败');
        }
    };

    const persist = async (): Promise<OperationResult> => {
        try {
            await pluginRepository.saveUiSettings({
                activeTab: activeTab.value,
                collapsed: collapsed.value,
                expandedFolderIds: expandedFolderIds.value,
                sidebarWidth: sidebarWidth.value,
            });
            return successResult(undefined);
        } catch (error) {
            return failureResult(error, '保存界面设置失败');
        }
    };

    const setActiveTab = async (tab: AppTab): Promise<OperationResult> => {
        activeTab.value = tab;
        const result = await persist();
        if (!result.success) notify(result.error, 'error');
        return result;
    };

    const toggleCollapsed = async (): Promise<OperationResult> => {
        collapsed.value = !collapsed.value;
        const result = await persist();
        if (!result.success) notify(result.error, 'error');
        return result;
    };

    const toggleFolderExpanded = async (folderId: string): Promise<OperationResult> => {
        expandedFolderIds.value = expandedFolderIds.value.includes(folderId)
            ? expandedFolderIds.value.filter(id => id !== folderId)
            : [...expandedFolderIds.value, folderId];
        const result = await persist();
        if (!result.success) notify(result.error, 'error');
        return result;
    };

    const previewSidebarWidth = (width: number): void => {
        sidebarWidth.value = width;
    };

    const saveSidebarWidth = async (width: number): Promise<OperationResult> => {
        sidebarWidth.value = width;
        const result = await persist();
        if (!result.success) notify(result.error, 'error');
        return result;
    };

    const notify = (message: string, type: NoticeType = 'success'): void => {
        const id = crypto.randomUUID();
        notices.value.push({ id, message, type });
        window.setTimeout(() => {
            notices.value = notices.value.filter(notice => notice.id !== id);
        }, 3500);
    };

    const confirm = (message: string): Promise<boolean> =>
        new Promise(resolve => {
            confirmRequest.value?.resolve(false);
            confirmRequest.value = { message, resolve };
        });

    const resolveConfirm = (confirmed: boolean): void => {
        confirmRequest.value?.resolve(confirmed);
        confirmRequest.value = null;
    };

    return {
        activeTab,
        collapsed,
        expandedFolderIds,
        sidebarWidth,
        expanded,
        notices,
        confirmRequest,
        initialize,
        setActiveTab,
        toggleCollapsed,
        toggleFolderExpanded,
        previewSidebarWidth,
        saveSidebarWidth,
        notify,
        confirm,
        resolveConfirm,
    };
});
