import type { TradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import { ensureResultItemTools, removeResultItemTool } from '@/result-enhancers/result-item-tools';
import type { TradeResultEnhancer } from '@/result-enhancers/types';
import type { useUiStore } from '@/stores/ui-store';
import { copyText } from '@/utils/clipboard';
import { translateItemText } from './services/item-translator';
import { captureNativeItemText } from './services/native-item-copy';

type UiStore = ReturnType<typeof useUiStore>;

const ENHANCED_ATTRIBUTE = 'data-ptp-item-translation-enhanced';
const ENTRY_CLASS = 'ptp-item-translation-entry';
const DEFAULT_BUTTON_TEXT = '复制英文';

export class ItemTranslationEnhancer implements TradeResultEnhancer {
    key = 'item-translation';

    constructor(
        private readonly adapter: TradeSiteAdapter,
        private readonly uiStore: UiStore
    ) {}

    enhance(row: HTMLElement): void {
        const renderedItem = this.adapter.getResultRenderedItem(row);
        if (!renderedItem) return;
        if (renderedItem.hasAttribute(ENHANCED_ATTRIBUTE)) {
            if (renderedItem.querySelector(`.${ENTRY_CLASS}`)) return;
            renderedItem.removeAttribute(ENHANCED_ATTRIBUTE);
        }

        const entry = document.createElement('span');
        entry.className = ENTRY_CLASS;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ptp-item-translation-button';
        button.textContent = DEFAULT_BUTTON_TEXT;
        button.title = '调用市集原生复制并将完整装备文本翻译为英文';
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            void this.translateAndCopy(row, button);
        });
        entry.appendChild(button);
        ensureResultItemTools(renderedItem).appendChild(entry);
        renderedItem.setAttribute(ENHANCED_ATTRIBUTE, 'true');
    }

    clear(): void {}

    dispose(): void {
        document.querySelectorAll<HTMLElement>(`.${ENTRY_CLASS}`).forEach(removeResultItemTool);
        document.querySelectorAll<HTMLElement>(`[${ENHANCED_ATTRIBUTE}]`).forEach(element => {
            element.removeAttribute(ENHANCED_ATTRIBUTE);
        });
    }

    /** 捕获市集生成的装备文本，翻译后覆盖剪贴板。 */
    private async translateAndCopy(row: HTMLElement, button: HTMLButtonElement): Promise<void> {
        if (button.disabled) return;
        button.disabled = true;
        button.textContent = '获取中…';

        try {
            const capturedResult = await captureNativeItemText(() => this.adapter.triggerResultItemCopy(row));
            if (!capturedResult.success) {
                this.uiStore.notify(capturedResult.error, 'error');
                return;
            }

            button.textContent = '翻译中…';
            const translatedResult = translateItemText(capturedResult.data);
            if (!translatedResult.success) {
                this.uiStore.notify(translatedResult.error, 'error');
                return;
            }

            await copyText(translatedResult.data);
            this.uiStore.notify('英文装备文本已复制');
        } catch (error) {
            console.error('[POE Trade Plugin] 翻译并复制结果商品失败', error);
            this.uiStore.notify(error instanceof Error ? error.message : '复制英文失败', 'error');
        } finally {
            button.disabled = false;
            button.textContent = DEFAULT_BUTTON_TEXT;
        }
    }
}
