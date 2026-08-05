import type { PinnedSnapshot, SearchLocation } from '@/types';

export interface TradeSiteAdapter {
    waitForTradeRoot(): Promise<HTMLElement>;
    getLayoutRoot(): HTMLElement;
    parseLocation(url: URL): SearchLocation | null;
    buildSearchUrl(location: SearchLocation): string;
    recommendSearchTitle(): string;
    observeResults(callback: (rows: HTMLElement[]) => void): () => void;
    createPinnedSnapshot(row: HTMLElement): PinnedSnapshot | null;
    getResultActionContainer(row: HTMLElement): HTMLElement | null;
    getResultRenderedItem(row: HTMLElement): HTMLElement | null;
    getResultDetailsText(row: HTMLElement): string;
    triggerResultItemCopy(row: HTMLElement): boolean;
    findResultRow(id: string): HTMLElement | null;
    setSidebarExpanded(expanded: boolean): void;
    setSidebarWidth(width: number): void;
}

const SELECTORS = {
    tradeRoot: '#trade',
    resultRows: '.resultset > .row[data-id]',
    resultActions: '.details .btns',
    details: '.middle',
    renderedItem: '.itemRendered',
    itemCopyButton: '.left > button.copy[title="复制物品"]',
    pricing: '.details .price',
    searchName: '.search-panel .search-bar .search-left input',
    category: '.search-advanced-items .filter-group:nth-of-type(1) .filter-property:nth-of-type(1) input',
    rarity: '.search-advanced-items .filter-group:nth-of-type(1) .filter-property:nth-of-type(2) input',
} as const;

const BASE_URL = 'https://poe.game.qq.com/trade/search';
const TRADE_ROOT_TIMEOUT = 30_000;

class PoeCnTradeSiteAdapter implements TradeSiteAdapter {
    async waitForTradeRoot(): Promise<HTMLElement> {
        const existingRoot = document.querySelector<HTMLElement>(SELECTORS.tradeRoot);
        if (existingRoot) return existingRoot;

        return new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                const root = document.querySelector<HTMLElement>(SELECTORS.tradeRoot);
                if (!root) return;
                observer.disconnect();
                window.clearTimeout(timeoutId);
                resolve(root);
            });
            const timeoutId = window.setTimeout(() => {
                observer.disconnect();
                reject(new Error('等待国服市集根节点超时'));
            }, TRADE_ROOT_TIMEOUT);

            observer.observe(document.documentElement, { childList: true, subtree: true });
        });
    }

    getLayoutRoot(): HTMLElement {
        return document.querySelector<HTMLElement>(SELECTORS.tradeRoot) ?? document.body;
    }

    parseLocation(url: URL): SearchLocation | null {
        const match = url.pathname.match(/^\/trade\/search\/([^/]+)\/([^/?#]+)/);
        if (!match) return null;
        return {
            league: decodeURIComponent(match[1]),
            slug: decodeURIComponent(match[2]),
        };
    }

    buildSearchUrl(location: SearchLocation): string {
        return `${BASE_URL}/${encodeURIComponent(location.league)}/${encodeURIComponent(location.slug)}`;
    }

    recommendSearchTitle(): string {
        const name = this.readInput(SELECTORS.searchName);
        if (name) return name;

        const category = this.readInput(SELECTORS.category, ['Any', '任意']);
        const rarity = this.readInput(SELECTORS.rarity, ['Any', '任意']);
        if (category && rarity) return `${category}（${rarity}）`;
        if (category) return category;
        return `未命名搜索 ${new Date().toLocaleString('zh-CN', { hour12: false })}`;
    }

    observeResults(callback: (rows: HTMLElement[]) => void): () => void {
        const root = this.getLayoutRoot().parentElement ?? this.getLayoutRoot();
        const scan = () => callback(Array.from(document.querySelectorAll<HTMLElement>(SELECTORS.resultRows)));
        const observer = new MutationObserver(scan);
        observer.observe(root, { childList: true, subtree: true });
        scan();
        return () => observer.disconnect();
    }

    createPinnedSnapshot(row: HTMLElement): PinnedSnapshot | null {
        const id = row.dataset.id;
        const detailsElement = row.querySelector<HTMLElement>(SELECTORS.details);
        const renderedItemElement = row.querySelector<HTMLElement>(SELECTORS.renderedItem);
        const pricingElement = row.querySelector<HTMLElement>(SELECTORS.pricing);
        if (!id || !detailsElement || !renderedItemElement || !pricingElement) return null;

        const renderedItemClone = renderedItemElement.cloneNode(true) as HTMLElement;
        renderedItemClone.querySelectorAll('[data-ptp-snapshot-exclude]').forEach(element => element.remove());
        renderedItemClone.removeAttribute('data-ptp-cluster-jewel-enhanced');
        renderedItemClone.classList.remove('ptp-result-item-tools-host');
        return {
            id,
            detailsElement: detailsElement.cloneNode(true) as HTMLElement,
            renderedItemElement: renderedItemClone,
            pricingElement: pricingElement.cloneNode(true) as HTMLElement,
        };
    }

    getResultActionContainer(row: HTMLElement): HTMLElement | null {
        return row.querySelector<HTMLElement>(SELECTORS.resultActions);
    }

    getResultRenderedItem(row: HTMLElement): HTMLElement | null {
        return row.querySelector<HTMLElement>(SELECTORS.renderedItem);
    }

    getResultDetailsText(row: HTMLElement): string {
        return row.querySelector<HTMLElement>(SELECTORS.details)?.innerText ?? '';
    }

    triggerResultItemCopy(row: HTMLElement): boolean {
        const copyButton = row.querySelector<HTMLButtonElement>(SELECTORS.itemCopyButton);
        if (!copyButton || copyButton.disabled) return false;
        // 直接调用真实按钮的 click，让市集自身的 Vue 事件生成完整装备文本。
        copyButton.click();
        return true;
    }

    findResultRow(id: string): HTMLElement | null {
        return (
            Array.from(document.querySelectorAll<HTMLElement>(SELECTORS.resultRows)).find(
                row => row.dataset.id === id
            ) ?? null
        );
    }

    setSidebarExpanded(expanded: boolean): void {
        document.querySelectorAll('.ptp-layout-expanded').forEach(element => {
            element.classList.remove('ptp-layout-expanded');
        });
        this.getLayoutRoot().classList.toggle('ptp-layout-expanded', expanded);
        document.body.classList.toggle('ptp-sidebar-expanded', expanded);
    }

    setSidebarWidth(width: number): void {
        document.documentElement.style.setProperty('--ptp-width', `${width}px`);
    }

    private readInput(selector: string, nullValues: string[] = []): string | null {
        const value = document.querySelector<HTMLInputElement>(selector)?.value.trim();
        if (!value || nullValues.includes(value)) return null;
        return value;
    }
}

export const tradeSiteAdapter: TradeSiteAdapter = new PoeCnTradeSiteAdapter();
