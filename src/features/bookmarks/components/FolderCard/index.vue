<template>
    <article v-bind="$attrs" class="ptp-folder-card" :class="{ 'is-archived': Boolean(folder.archivedAt) }">
        <header class="ptp-folder-header">
            <button class="ptp-folder-title" type="button" :disabled="Boolean(folder.archivedAt)" @click="toggleExpanded">
                <FolderIcon :icon="folder.icon" />
                <span>{{ folder.title }}</span>
                <span class="ptp-count">{{ searches.length }}</span>
                <span v-if="!folder.archivedAt" :class="expanded ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'"></span>
            </button>
            <div class="ptp-folder-actions">
                <button v-if="!folder.archivedAt" type="button" class="ptp-icon-button" title="编辑文件夹" @click="$emit('edit', folder)">
                    <span class="i-mdi-pencil"></span>
                </button>
                <button type="button" class="ptp-icon-button" title="导出文件夹" @click="exportFolder">
                    <span class="i-mdi-file-export"></span>
                </button>
                <button type="button" class="ptp-icon-button" :title="folder.archivedAt ? '恢复文件夹' : '归档文件夹'" @click="toggleArchive">
                    <span :class="folder.archivedAt ? 'i-mdi-archive-arrow-up' : 'i-mdi-archive'"></span>
                </button>
                <button v-if="folder.archivedAt" type="button" class="ptp-icon-button is-danger" title="删除文件夹" @click="deleteFolder">
                    <span class="i-mdi-delete"></span>
                </button>
                <button v-else type="button" class="ptp-icon-button ptp-drag-handle" title="拖动排序" data-sort-handle>
                    <span class="i-mdi-drag"></span>
                </button>
            </div>
        </header>

        <div v-if="expanded && !folder.archivedAt" class="ptp-folder-content">
            <ul ref="searchListRef" class="ptp-search-list">
                <li v-for="search in searches" :key="search.id" :data-sort-id="search.id" class="ptp-search-item">
                    <a
                        href="#"
                        class="ptp-search-link"
                        :class="{ 'is-completed': Boolean(search.completedAt) }"
                        :title="`${search.sourceLeague}/${search.slug}`"
                        @click.prevent="openSearch(search)"
                    >
                        <span v-if="search.completedAt" class="i-mdi-check-circle"></span>
                        <span>{{ search.title }}</span>
                    </a>
                    <div class="ptp-search-actions">
                        <button type="button" class="ptp-icon-button" title="复制链接" @click="copySearch(search)"><span class="i-mdi-content-copy"></span></button>
                        <button type="button" class="ptp-icon-button" title="更新为当前搜索" :disabled="!tradeStore.hasSearch" @click="updateLocation(search)"><span class="i-mdi-link-variant"></span></button>
                        <button type="button" class="ptp-icon-button" :title="search.completedAt ? '取消完成' : '标记完成'" @click="toggleCompleted(search)"><span class="i-mdi-check"></span></button>
                        <button type="button" class="ptp-icon-button" title="重命名" @click="startRename(search)"><span class="i-mdi-pencil"></span></button>
                        <button type="button" class="ptp-icon-button is-danger" title="删除" @click="deleteSearch(search)"><span class="i-mdi-delete"></span></button>
                        <button type="button" class="ptp-icon-button ptp-drag-handle" title="拖动排序" data-sort-handle><span class="i-mdi-drag"></span></button>
                    </div>
                </li>
            </ul>
            <div v-if="!searches.length" class="ptp-empty-inline">这个文件夹还没有保存搜索</div>
            <AppButton
                label="保存当前搜索"
                icon="i-mdi-bookmark-plus"
                variant="blue"
                block
                :disabled="!tradeStore.hasSearch"
                @click="saveCurrentSearch"
            />
        </div>
    </article>

    <AppModal v-model="renameVisible" title="重命名搜索">
        <label class="ptp-field">
            <span>搜索名称</span>
            <input v-model="renameTitle" maxlength="40" @keyup.enter="saveRename" />
        </label>
        <template #footer>
            <AppButton label="取消" variant="ghost" @click="renameVisible = false" />
            <AppButton label="保存" :disabled="!renameTitle.trim()" @click="saveRename" />
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AppButton from '@/components/AppButton/index.vue';
import AppModal from '@/components/AppModal/index.vue';
import FolderIcon from '@/components/FolderIcon/index.vue';
import { tradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import { downloadJson } from '@/data/sync/backup-service';
import { useSortableList } from '@/composables/use-sortable-list';
import { useBookmarksStore } from '@/stores/bookmarks-store';
import { useTradeStore } from '@/stores/trade-store';
import { useUiStore } from '@/stores/ui-store';
import { copyText } from '@/utils/clipboard';
import type { BookmarkFolder, OperationResult, SavedSearch } from '@/types';

defineOptions({ inheritAttrs: false });

const props = defineProps<{ folder: BookmarkFolder }>();
defineEmits<{ edit: [folder: BookmarkFolder] }>();

const bookmarksStore = useBookmarksStore();
const tradeStore = useTradeStore();
const uiStore = useUiStore();
const searchListRef = ref<HTMLElement | null>(null);
const renameVisible = ref(false);
const renameTitle = ref('');
const renamingSearchId = ref<string | null>(null);

const expanded = computed(() => uiStore.expandedFolderIds.includes(props.folder.id));
const searches = computed(() => bookmarksStore.searchesByFolder(props.folder.id));

useSortableList(searchListRef, async ids => {
    notifyResult(await bookmarksStore.reorderSearches(props.folder.id, ids), '搜索排序已保存');
});

function notifyResult<T>(result: OperationResult<T>, message: string): boolean {
    uiStore.notify(result.success ? message : result.error, result.success ? 'success' : 'error');
    return result.success;
}

const toggleExpanded = (): void => {
    if (!props.folder.archivedAt) void uiStore.toggleFolderExpanded(props.folder.id);
};

const saveCurrentSearch = async (): Promise<void> => {
    const location = tradeStore.currentLocation;
    if (!location) return;
    const result = await bookmarksStore.addSearch(props.folder.id, tradeStore.recommendedTitle, location);
    notifyResult(result, '当前搜索已保存');
};

const openSearch = (search: SavedSearch): void => {
    const league = tradeStore.currentLocation?.league || search.sourceLeague;
    window.open(tradeSiteAdapter.buildSearchUrl({ league, slug: search.slug }), '_blank', 'noopener');
};

const copySearch = async (search: SavedSearch): Promise<void> => {
    try {
        const league = tradeStore.currentLocation?.league || search.sourceLeague;
        await copyText(tradeSiteAdapter.buildSearchUrl({ league, slug: search.slug }));
        uiStore.notify('搜索链接已复制');
    } catch (error) {
        console.error('[POE Trade Plugin] 复制搜索链接失败', error);
        uiStore.notify('复制搜索链接失败', 'error');
    }
};

const updateLocation = async (search: SavedSearch): Promise<void> => {
    const location = tradeStore.currentLocation;
    if (!location) return;
    notifyResult(await bookmarksStore.updateSearchLocation(search.id, location), '搜索地址已更新');
};

const toggleCompleted = async (search: SavedSearch): Promise<void> => {
    notifyResult(await bookmarksStore.toggleSearchCompleted(search.id), '完成状态已更新');
};

const startRename = (search: SavedSearch): void => {
    renamingSearchId.value = search.id;
    renameTitle.value = search.title;
    renameVisible.value = true;
};

const saveRename = async (): Promise<void> => {
    if (!renamingSearchId.value || !renameTitle.value.trim()) return;
    const result = await bookmarksStore.updateSearchTitle(renamingSearchId.value, renameTitle.value);
    if (notifyResult(result, '搜索已重命名')) renameVisible.value = false;
};

const deleteSearch = async (search: SavedSearch): Promise<void> => {
    if (!(await uiStore.confirm(`确定删除“${search.title}”吗？`))) return;
    notifyResult(await bookmarksStore.deleteSearch(search.id), '搜索已删除');
};

const toggleArchive = async (): Promise<void> => {
    const archived = !props.folder.archivedAt;
    const result = await bookmarksStore.setFolderArchived(props.folder.id, archived);
    notifyResult(result, archived ? '文件夹已归档' : '文件夹已恢复');
};

const deleteFolder = async (): Promise<void> => {
    if (!(await uiStore.confirm(`删除“${props.folder.title}”及其中全部搜索？此操作无法撤销。`))) return;
    notifyResult(await bookmarksStore.deleteFolder(props.folder.id), '文件夹已删除');
};

const exportFolder = (): void => {
    const backup = bookmarksStore.createFolderBackup(props.folder.id);
    if (!backup) {
        uiStore.notify('导出文件夹失败', 'error');
        return;
    }
    downloadJson(`poe-trade-folder-${props.folder.title}.json`, backup);
    uiStore.notify('文件夹备份已导出');
};
</script>
