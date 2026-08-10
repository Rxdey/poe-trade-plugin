import type { BookmarkFolder, HistoryEntry, SavedSearch, UiSettings } from '@/types';
import type { StorageDriver } from '../storage/storage-driver';

const STORAGE_KEYS = {
    bookmarks: 'ptp-bookmarks-v1',
    history: 'ptp-history-v1',
    uiSettings: 'ptp-ui-settings-v2',
} as const;

export interface BookmarksData {
    folders: BookmarkFolder[];
    savedSearches: SavedSearch[];
}

const DEFAULT_UI_SETTINGS: UiSettings = {
    activeTab: 'bookmarks',
    collapsed: true,
    expandedFolderIds: [],
    sidebarWidth: 420,
    chaosDivineFilterEnabled: false,
};

const MIN_SIDEBAR_WIDTH = 340;
const MAX_SIDEBAR_WIDTH = 720;
const APP_TABS = new Set(['bookmarks', 'history', 'pinned-items']);

export class PluginRepository {
    constructor(private readonly storage: StorageDriver) {}

    getBookmarks(): Promise<BookmarksData> {
        return this.read(STORAGE_KEYS.bookmarks, { folders: [], savedSearches: [] });
    }

    saveBookmarks(data: BookmarksData): Promise<void> {
        return this.write(STORAGE_KEYS.bookmarks, data);
    }

    getHistory(): Promise<HistoryEntry[]> {
        return this.read(STORAGE_KEYS.history, []);
    }

    saveHistory(history: HistoryEntry[]): Promise<void> {
        return this.write(STORAGE_KEYS.history, history);
    }

    clearHistory(): Promise<void> {
        return this.remove(STORAGE_KEYS.history);
    }

    async getUiSettings(): Promise<UiSettings> {
        const value = await this.read<unknown>(STORAGE_KEYS.uiSettings, DEFAULT_UI_SETTINGS);
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return { ...DEFAULT_UI_SETTINGS };
        }
        const settings = value as Record<string, unknown>;
        const sidebarWidth = typeof settings.sidebarWidth === 'number' && Number.isFinite(settings.sidebarWidth)
            ? Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(settings.sidebarWidth)))
            : DEFAULT_UI_SETTINGS.sidebarWidth;
        return {
            activeTab:
                typeof settings.activeTab === 'string' && APP_TABS.has(settings.activeTab)
                    ? (settings.activeTab as UiSettings['activeTab'])
                    : DEFAULT_UI_SETTINGS.activeTab,
            collapsed:
                typeof settings.collapsed === 'boolean' ? settings.collapsed : DEFAULT_UI_SETTINGS.collapsed,
            expandedFolderIds: Array.isArray(settings.expandedFolderIds)
                ? settings.expandedFolderIds.filter((id): id is string => typeof id === 'string')
                : [],
            sidebarWidth,
            chaosDivineFilterEnabled:
                typeof settings.chaosDivineFilterEnabled === 'boolean'
                    ? settings.chaosDivineFilterEnabled
                    : DEFAULT_UI_SETTINGS.chaosDivineFilterEnabled,
        };
    }

    saveUiSettings(settings: UiSettings): Promise<void> {
        return this.write(STORAGE_KEYS.uiSettings, settings);
    }

    private async read<T>(key: string, fallbackValue: T): Promise<T> {
        try {
            return await this.storage.get(key, fallbackValue);
        } catch (error) {
            console.error(`[POE Trade Plugin] 读取存储失败: ${key}`, error);
            throw error;
        }
    }

    private async write<T>(key: string, value: T): Promise<void> {
        try {
            await this.storage.set(key, value);
        } catch (error) {
            console.error(`[POE Trade Plugin] 写入存储失败: ${key}`, error);
            throw error;
        }
    }

    private async remove(key: string): Promise<void> {
        try {
            await this.storage.remove(key);
        } catch (error) {
            console.error(`[POE Trade Plugin] 删除存储失败: ${key}`, error);
            throw error;
        }
    }
}

export const DEFAULT_SETTINGS = DEFAULT_UI_SETTINGS;
