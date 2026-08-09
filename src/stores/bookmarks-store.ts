import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { pluginRepository } from '@/data';
import { parseFolderBackup, parsePluginBackup } from '@/data/sync/backup-service';
import {
    failureResult,
    successResult,
    type BookmarkFolder,
    type FolderBackupV1,
    type FolderIconId,
    type OperationResult,
    type PluginBackupV1,
    type SavedSearch,
    type SearchLocation,
} from '@/types';

export const useBookmarksStore = defineStore('bookmarks', () => {
    const folders = ref<BookmarkFolder[]>([]);
    const savedSearches = ref<SavedSearch[]>([]);
    const activeFolders = computed(() => sortByOrder(folders.value.filter(folder => !folder.archivedAt)));
    const archivedFolders = computed(() => sortByOrder(folders.value.filter(folder => folder.archivedAt)));

    const initialize = async (): Promise<OperationResult> => {
        try {
            const data = await pluginRepository.getBookmarks();
            folders.value = data.folders;
            savedSearches.value = data.savedSearches;
            return successResult(undefined);
        } catch (error) {
            return failureResult(error, '加载收藏夹失败');
        }
    };

    const commit = async (
        nextFolders: BookmarkFolder[],
        nextSearches: SavedSearch[],
        context: string
    ): Promise<OperationResult> => {
        try {
            await pluginRepository.saveBookmarks({ folders: nextFolders, savedSearches: nextSearches });
            folders.value = nextFolders;
            savedSearches.value = nextSearches;
            return successResult(undefined);
        } catch (error) {
            return failureResult(error, context);
        }
    };

    const createFolder = async (title: string, icon: FolderIconId | null): Promise<OperationResult<string>> => {
        const now = new Date().toISOString();
        const folder: BookmarkFolder = {
            id: crypto.randomUUID(),
            title: title.trim(),
            icon,
            order: activeFolders.value.length,
            archivedAt: null,
            createdAt: now,
            updatedAt: now,
        };
        const result = await commit([...folders.value, folder], savedSearches.value, '创建文件夹失败');
        return result.success ? successResult(folder.id) : result;
    };

    const updateFolder = async (
        folderId: string,
        title: string,
        icon: FolderIconId | null
    ): Promise<OperationResult> => {
        const nextFolders = folders.value.map(folder =>
            folder.id === folderId
                ? { ...folder, title: title.trim(), icon, updatedAt: new Date().toISOString() }
                : folder
        );
        return commit(nextFolders, savedSearches.value, '更新文件夹失败');
    };

    const setFolderArchived = async (folderId: string, archived: boolean): Promise<OperationResult> => {
        const now = new Date().toISOString();
        const nextFolders = folders.value.map(folder =>
            folder.id === folderId
                ? {
                      ...folder,
                      archivedAt: archived ? now : null,
                      order: folders.value.filter(item => Boolean(item.archivedAt) === archived).length,
                      updatedAt: now,
                  }
                : folder
        );
        return commit(nextFolders, savedSearches.value, archived ? '归档文件夹失败' : '恢复文件夹失败');
    };

    const deleteFolder = async (folderId: string): Promise<OperationResult> => {
        const target = folders.value.find(folder => folder.id === folderId);
        if (!target?.archivedAt) return failureResult(new Error('文件夹归档后才能删除'), '删除文件夹失败');
        return commit(
            folders.value.filter(folder => folder.id !== folderId),
            savedSearches.value.filter(search => search.folderId !== folderId),
            '删除文件夹失败'
        );
    };

    const reorderFolders = async (orderedIds: string[]): Promise<OperationResult> => {
        const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
        const nextFolders = folders.value.map(folder =>
            orderMap.has(folder.id) ? { ...folder, order: orderMap.get(folder.id) ?? folder.order } : folder
        );
        return commit(nextFolders, savedSearches.value, '保存文件夹排序失败');
    };

    const searchesByFolder = (folderId: string): SavedSearch[] =>
        sortByOrder(savedSearches.value.filter(search => search.folderId === folderId));

    const addSearch = async (
        folderId: string,
        title: string,
        location: SearchLocation
    ): Promise<OperationResult<string>> => {
        if (!folders.value.some(folder => folder.id === folderId && !folder.archivedAt)) {
            return failureResult(new Error('目标文件夹不存在或已归档'), '保存搜索失败');
        }
        const now = new Date().toISOString();
        const search: SavedSearch = {
            id: crypto.randomUUID(),
            folderId,
            title: title.trim(),
            slug: location.slug,
            sourceLeague: location.league,
            order: searchesByFolder(folderId).length,
            completedAt: null,
            createdAt: now,
            updatedAt: now,
        };
        const result = await commit(folders.value, [...savedSearches.value, search], '保存搜索失败');
        return result.success ? successResult(search.id) : result;
    };

    const updateSearchTitle = async (searchId: string, title: string): Promise<OperationResult> => {
        const nextSearches = savedSearches.value.map(search =>
            search.id === searchId ? { ...search, title: title.trim(), updatedAt: new Date().toISOString() } : search
        );
        return commit(folders.value, nextSearches, '重命名搜索失败');
    };

    const updateSearchLocation = async (searchId: string, location: SearchLocation): Promise<OperationResult> => {
        const nextSearches = savedSearches.value.map(search =>
            search.id === searchId
                ? {
                      ...search,
                      slug: location.slug,
                      sourceLeague: location.league,
                      updatedAt: new Date().toISOString(),
                  }
                : search
        );
        return commit(folders.value, nextSearches, '更新搜索地址失败');
    };

    const deleteSearch = async (searchId: string): Promise<OperationResult> =>
        commit(
            folders.value,
            savedSearches.value.filter(search => search.id !== searchId),
            '删除搜索失败'
        );

    const reorderSearches = async (folderId: string, orderedIds: string[]): Promise<OperationResult> => {
        const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
        const nextSearches = savedSearches.value.map(search =>
            search.folderId === folderId && orderMap.has(search.id)
                ? { ...search, order: orderMap.get(search.id) ?? search.order }
                : search
        );
        return commit(folders.value, nextSearches, '保存搜索排序失败');
    };

    const createBackup = (): PluginBackupV1 => ({
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        folders: folders.value,
        savedSearches: savedSearches.value,
    });

    const createFolderBackup = (folderId: string): FolderBackupV1 | null => {
        const folder = folders.value.find(item => item.id === folderId);
        if (!folder) return null;
        return {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            folder,
            savedSearches: searchesByFolder(folderId),
        };
    };

    const importBackup = async (text: string): Promise<OperationResult<number>> => {
        try {
            const backup = parsePluginBackup(text);
            return importData(backup.folders, backup.savedSearches, '导入完整备份失败');
        } catch (error) {
            return failureResult(error, '解析完整备份失败');
        }
    };

    const importFolderBackup = async (text: string): Promise<OperationResult<number>> => {
        try {
            const backup = parseFolderBackup(text);
            return importData([backup.folder], backup.savedSearches, '导入文件夹失败');
        } catch (error) {
            return failureResult(error, '解析文件夹备份失败');
        }
    };

    const importData = async (
        importedFolders: BookmarkFolder[],
        importedSearches: SavedSearch[],
        context: string
    ): Promise<OperationResult<number>> => {
        const folderIds = new Map<string, string>();
        let activeOrder = activeFolders.value.length;
        let archivedOrder = archivedFolders.value.length;
        const nextFolders = importedFolders.map(folder => {
            const id = crypto.randomUUID();
            folderIds.set(folder.id, id);
            const order = folder.archivedAt ? archivedOrder++ : activeOrder++;
            return { ...folder, id, order };
        });
        const nextSearches = importedSearches.map(search => ({
            ...search,
            id: crypto.randomUUID(),
            folderId: folderIds.get(search.folderId) ?? '',
        }));
        const result = await commit(
            [...folders.value, ...nextFolders],
            [...savedSearches.value, ...nextSearches],
            context
        );
        return result.success ? successResult(nextFolders.length) : result;
    };

    return {
        folders,
        savedSearches,
        activeFolders,
        archivedFolders,
        initialize,
        createFolder,
        updateFolder,
        setFolderArchived,
        deleteFolder,
        reorderFolders,
        searchesByFolder,
        addSearch,
        updateSearchTitle,
        updateSearchLocation,
        deleteSearch,
        reorderSearches,
        createBackup,
        createFolderBackup,
        importBackup,
        importFolderBackup,
    };
});

const sortByOrder = <T extends { order: number }>(items: T[]): T[] => [...items].sort((a, b) => a.order - b.order);
