<template>
    <section class="ptp-page">
        <div class="ptp-toolbar">
            <AppButton label="新建" icon="i-mdi-folder-plus" @click="openCreateFolder" />
            <AppButton label="导入文件夹" icon="i-mdi-file-import" variant="blue" @click="importFolder" />
            <AppButton label="导出备份" icon="i-mdi-download" variant="blue" @click="exportBackup" />
            <AppButton label="恢复备份" icon="i-mdi-upload" variant="blue" @click="importBackup" />
        </div>

        <div class="ptp-section-heading">
            <span>{{ showArchived ? '已归档文件夹' : '活跃文件夹' }}</span>
            <button type="button" class="ptp-text-button" @click="showArchived = !showArchived">
                {{ showArchived ? '返回活跃文件夹' : `查看归档（${bookmarksStore.archivedFolders.length}）` }}
            </button>
        </div>

        <div v-if="!showArchived" ref="folderListRef" class="ptp-folder-list">
            <FolderCard
                v-for="folder in bookmarksStore.activeFolders"
                :key="folder.id"
                :folder="folder"
                :data-sort-id="folder.id"
                @edit="openEditFolder"
            />
        </div>
        <div v-else class="ptp-folder-list">
            <FolderCard
                v-for="folder in bookmarksStore.archivedFolders"
                :key="folder.id"
                :folder="folder"
                @edit="openEditFolder"
            />
        </div>

        <div v-if="!displayedFolders.length" class="ptp-empty-state">
            <span class="i-mdi-folder-open-outline"></span>
            <p>{{ showArchived ? '没有已归档文件夹' : '创建文件夹，然后保存当前搜索' }}</p>
        </div>
    </section>

    <FolderFormModal v-model="folderModalVisible" :folder="editingFolder" @save="saveFolder" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AppButton from '@/components/AppButton/index.vue';
import FolderCard from './components/FolderCard/index.vue';
import FolderFormModal from './components/FolderFormModal/index.vue';
import { useSortableList } from '@/composables/use-sortable-list';
import { downloadJson, selectJsonFile } from '@/data/sync/backup-service';
import { useBookmarksStore } from '@/stores/bookmarks-store';
import { useUiStore } from '@/stores/ui-store';
import type { BookmarkFolder, FolderIconId, OperationResult } from '@/types';

const bookmarksStore = useBookmarksStore();
const uiStore = useUiStore();
const showArchived = ref(false);
const folderListRef = ref<HTMLElement | null>(null);
const folderModalVisible = ref(false);
const editingFolder = ref<BookmarkFolder | null>(null);
const displayedFolders = computed(() =>
    showArchived.value ? bookmarksStore.archivedFolders : bookmarksStore.activeFolders
);

useSortableList(folderListRef, async ids => {
    notifyResult(await bookmarksStore.reorderFolders(ids), '文件夹排序已保存');
});

function notifyResult<T>(
    result: OperationResult<T>,
    message: string
): result is { success: true; data: T } {
    uiStore.notify(result.success ? message : result.error, result.success ? 'success' : 'error');
    return result.success;
}

const openCreateFolder = (): void => {
    editingFolder.value = null;
    folderModalVisible.value = true;
};

const openEditFolder = (folder: BookmarkFolder): void => {
    editingFolder.value = folder;
    folderModalVisible.value = true;
};

const saveFolder = async (payload: { title: string; icon: FolderIconId | null }): Promise<void> => {
    if (editingFolder.value) {
        const result = await bookmarksStore.updateFolder(editingFolder.value.id, payload.title, payload.icon);
        if (!notifyResult(result, '文件夹已更新')) return;
    } else {
        const result = await bookmarksStore.createFolder(payload.title, payload.icon);
        if (!notifyResult(result, '文件夹已创建')) return;
        await uiStore.toggleFolderExpanded(result.data);
    }
    folderModalVisible.value = false;
};

const exportBackup = (): void => {
    downloadJson(`poe-trade-backup-${new Date().toISOString().slice(0, 10)}.json`, bookmarksStore.createBackup());
    uiStore.notify('完整收藏备份已导出');
};

const importBackup = async (): Promise<void> => {
    try {
        const text = await selectJsonFile();
        if (!text) return;
        const result = await bookmarksStore.importBackup(text);
        notifyResult(result, result.success ? `已导入 ${result.data} 个文件夹` : '导入失败');
    } catch (error) {
        console.error('[POE Trade Plugin] 导入完整备份失败', error);
        uiStore.notify('读取备份文件失败', 'error');
    }
};

const importFolder = async (): Promise<void> => {
    try {
        const text = await selectJsonFile();
        if (!text) return;
        const result = await bookmarksStore.importFolderBackup(text);
        notifyResult(result, result.success ? '文件夹已导入' : '导入失败');
    } catch (error) {
        console.error('[POE Trade Plugin] 导入文件夹备份失败', error);
        uiStore.notify('读取备份文件失败', 'error');
    }
};
</script>
