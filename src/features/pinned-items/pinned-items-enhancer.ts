import { watch, type WatchStopHandle } from 'vue';
import type { TradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import type { TradeResultEnhancer } from '@/result-enhancers/types';
import type { usePinnedItemsStore } from '@/stores/pinned-items-store';
import type { useUiStore } from '@/stores/ui-store';

type PinnedStore = ReturnType<typeof usePinnedItemsStore>;
type UiStore = ReturnType<typeof useUiStore>;

const ENHANCED_ATTRIBUTE = 'data-ptp-pinned-items-enhanced';

export class PinnedItemsEnhancer implements TradeResultEnhancer {
    key = 'pinned-items';
    private readonly stopWatching: WatchStopHandle;

    constructor(
        private readonly adapter: TradeSiteAdapter,
        private readonly pinnedStore: PinnedStore,
        private readonly uiStore: UiStore
    ) {
        this.stopWatching = watch(
            () => pinnedStore.revision,
            () => this.syncButtons()
        );
    }

    enhance(row: HTMLElement): void {
        if (row.hasAttribute(ENHANCED_ATTRIBUTE)) return;
        const actions = this.adapter.getResultActionContainer(row);
        if (!actions || !row.dataset.id) return;

        const wrapper = document.createElement('span');
        wrapper.className = 'ptp-pin-button-wrapper';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ptp-pin-button';
        button.addEventListener('click', () => this.handleClick(row));
        wrapper.appendChild(button);
        actions.appendChild(wrapper);
        row.setAttribute(ENHANCED_ATTRIBUTE, 'true');
        this.syncButton(row, button);
    }

    clear(): void {
        this.pinnedStore.clear();
    }

    dispose(): void {
        this.stopWatching();
        document.querySelectorAll('.ptp-pin-button-wrapper').forEach(element => element.remove());
        document.querySelectorAll(`[${ENHANCED_ATTRIBUTE}]`).forEach(element => element.removeAttribute(ENHANCED_ATTRIBUTE));
    }

    private handleClick(row: HTMLElement): void {
        const snapshot = this.adapter.createPinnedSnapshot(row);
        if (!snapshot) {
            this.uiStore.notify('无法读取该商品，固定失败', 'error');
            return;
        }
        const pinned = this.pinnedStore.toggle(snapshot);
        if (pinned) void this.uiStore.setActiveTab('pinned-items');
    }

    private syncButtons(): void {
        document.querySelectorAll<HTMLElement>(`[${ENHANCED_ATTRIBUTE}]`).forEach(row => {
            const button = row.querySelector<HTMLButtonElement>('.ptp-pin-button');
            if (button) this.syncButton(row, button);
        });
    }

    private syncButton(row: HTMLElement, button: HTMLButtonElement): void {
        const pinned = Boolean(row.dataset.id && this.pinnedStore.has(row.dataset.id));
        button.textContent = pinned ? '取消固定' : '固定商品';
        button.classList.toggle('is-pinned', pinned);
    }
}
