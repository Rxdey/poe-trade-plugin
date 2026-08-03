import type {
    BookmarkFolder,
    FolderBackupV1,
    FolderIconId,
    PluginBackupV1,
    SavedSearch,
} from '@/types';

const FOLDER_ICONS: FolderIconId[] = ['folder', 'weapon', 'armor', 'jewel', 'currency', 'map', 'gem', 'misc'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && Boolean(value.trim());

const isValidOrder = (value: unknown): value is number =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const isIsoDate = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const isNullableIsoDate = (value: unknown): value is string | null => value === null || isIsoDate(value);

const isFolder = (value: unknown): value is BookmarkFolder => {
    if (!isRecord(value)) return false;
    const icon = value.icon;
    return (
        isNonEmptyString(value.id) &&
        isNonEmptyString(value.title) &&
        (icon === null || (typeof icon === 'string' && FOLDER_ICONS.includes(icon as FolderIconId))) &&
        isValidOrder(value.order) &&
        isNullableIsoDate(value.archivedAt) &&
        isIsoDate(value.createdAt) &&
        isIsoDate(value.updatedAt)
    );
};

const isSavedSearch = (value: unknown): value is SavedSearch => {
    if (!isRecord(value)) return false;
    return (
        isNonEmptyString(value.id) &&
        isNonEmptyString(value.folderId) &&
        isNonEmptyString(value.title) &&
        isNonEmptyString(value.slug) &&
        isNonEmptyString(value.sourceLeague) &&
        isValidOrder(value.order) &&
        isNullableIsoDate(value.completedAt) &&
        isIsoDate(value.createdAt) &&
        isIsoDate(value.updatedAt)
    );
};

const validateSearchFolderReferences = (folders: BookmarkFolder[], searches: SavedSearch[]): boolean => {
    const folderIds = new Set(folders.map(folder => folder.id));
    return searches.every(search => folderIds.has(search.folderId));
};

const hasUniqueIds = (items: Array<{ id: string }>): boolean =>
    new Set(items.map(item => item.id)).size === items.length;

export const parsePluginBackup = (text: string): PluginBackupV1 => {
    const value: unknown = JSON.parse(text);
    if (!isRecord(value) || value.schemaVersion !== 1 || !isIsoDate(value.exportedAt)) {
        throw new Error('不是有效的 3.0 收藏备份');
    }
    if (!Array.isArray(value.folders) || !value.folders.every(isFolder)) {
        throw new Error('备份中的文件夹数据无效');
    }
    if (!Array.isArray(value.savedSearches) || !value.savedSearches.every(isSavedSearch)) {
        throw new Error('备份中的搜索数据无效');
    }
    if (!validateSearchFolderReferences(value.folders, value.savedSearches)) {
        throw new Error('备份中存在没有对应文件夹的搜索');
    }
    if (!hasUniqueIds(value.folders) || !hasUniqueIds(value.savedSearches)) {
        throw new Error('备份中存在重复 ID');
    }
    return value as unknown as PluginBackupV1;
};

export const parseFolderBackup = (text: string): FolderBackupV1 => {
    const value: unknown = JSON.parse(text);
    if (!isRecord(value) || value.schemaVersion !== 1 || !isIsoDate(value.exportedAt)) {
        throw new Error('不是有效的 3.0 文件夹备份');
    }
    const folder = value.folder;
    const savedSearches = value.savedSearches;
    if (!isFolder(folder) || !Array.isArray(savedSearches) || !savedSearches.every(isSavedSearch)) {
        throw new Error('文件夹备份内容无效');
    }
    if (!savedSearches.every(search => search.folderId === folder.id)) {
        throw new Error('文件夹备份中的搜索归属无效');
    }
    if (!hasUniqueIds(savedSearches)) {
        throw new Error('文件夹备份中存在重复搜索 ID');
    }
    return value as unknown as FolderBackupV1;
};

export const downloadJson = (filename: string, value: unknown): void => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

export const selectJsonFile = (): Promise<string | null> =>
    new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.addEventListener('cancel', () => resolve(null), { once: true });
        input.addEventListener('change', async () => {
            const file = input.files?.[0];
            if (!file) {
                resolve(null);
                return;
            }
            try {
                resolve(await file.text());
            } catch (error) {
                console.error('[POE Trade Plugin] 读取备份文件失败', error);
                reject(error);
            }
        }, { once: true });
        input.click();
    });
