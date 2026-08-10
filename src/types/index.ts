export type AppTab = 'bookmarks' | 'history' | 'pinned-items';

export type FolderIconId = 'folder' | 'weapon' | 'armor' | 'jewel' | 'currency' | 'map' | 'gem' | 'misc';

export interface SearchLocation {
    /** 搜索所属赛季。 */
    league: string;
    /** 市集生成的搜索 ID。 */
    slug: string;
}

export interface BookmarkFolder {
    /** 插件内部文件夹 ID。 */
    id: string;
    /** 文件夹显示名称。 */
    title: string;
    /** 预设图标 ID，空值使用默认文件夹图标。 */
    icon: FolderIconId | null;
    /** 所在分组内的排序序号。 */
    order: number;
    /** UTC ISO 归档时间，空值表示活跃。 */
    archivedAt: string | null;
    /** UTC ISO 创建时间。 */
    createdAt: string;
    /** UTC ISO 最后更新时间。 */
    updatedAt: string;
}

export interface SavedSearch {
    /** 插件内部搜索 ID。 */
    id: string;
    /** 所属文件夹 ID。 */
    folderId: string;
    /** 搜索显示名称。 */
    title: string;
    /** 市集生成的搜索 ID。 */
    slug: string;
    /** 保存该搜索时的赛季。 */
    sourceLeague: string;
    /** 文件夹内的排序序号。 */
    order: number;
    /** UTC ISO 完成时间，空值表示未完成。 */
    completedAt: string | null;
    /** UTC ISO 创建时间。 */
    createdAt: string;
    /** UTC ISO 最后更新时间。 */
    updatedAt: string;
}

export interface HistoryEntry {
    /** 历史记录 ID。 */
    id: string;
    /** 记录当时的推荐标题。 */
    title: string;
    /** 访问时的赛季。 */
    league: string;
    /** 访问时的搜索 ID。 */
    slug: string;
    /** UTC ISO 访问时间。 */
    visitedAt: string;
}

export interface UiSettings {
    /** 当前激活的侧栏页签。 */
    activeTab: AppTab;
    /** 侧栏是否处于折叠状态。 */
    collapsed: boolean;
    /** 当前展开的文件夹 ID列表。 */
    expandedFolderIds: string[];
    /** 展开时的侧栏宽度，单位为像素。 */
    sidebarWidth: number;
    /** 是否为交易搜索请求合并混沌/神圣价格过滤。 */
    chaosDivineFilterEnabled: boolean;
}

export interface PluginBackupV1 {
    /** 备份结构版本。 */
    schemaVersion: 1;
    /** UTC ISO 导出时间。 */
    exportedAt: string;
    /** 导出的全部文件夹。 */
    folders: BookmarkFolder[];
    /** 导出的全部收藏搜索。 */
    savedSearches: SavedSearch[];
}

export interface FolderBackupV1 {
    /** 备份结构版本。 */
    schemaVersion: 1;
    /** UTC ISO 导出时间。 */
    exportedAt: string;
    /** 导出的单个文件夹。 */
    folder: BookmarkFolder;
    /** 该文件夹中的收藏搜索。 */
    savedSearches: SavedSearch[];
}

export interface PinnedSnapshot {
    /** 当前搜索结果的 data-id。 */
    id: string;
    /** 商品详情 DOM 快照。 */
    detailsElement: HTMLElement;
    /** 商品图 DOM 快照。 */
    renderedItemElement: HTMLElement;
    /** 价格 DOM 快照。 */
    pricingElement: HTMLElement;
}

export interface PinnedItem extends PinnedSnapshot {
    /** UTC ISO 固定时间。 */
    pinnedAt: string;
}

export type OperationResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

export const successResult = <T>(data: T): OperationResult<T> => ({ success: true, data });

export const failureResult = (error: unknown, context: string): OperationResult<never> => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[POE Trade Plugin] ${context}`, error);
    return { success: false, error: message };
};
