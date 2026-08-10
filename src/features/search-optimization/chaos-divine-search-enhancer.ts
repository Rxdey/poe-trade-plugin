import type { TradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import type { useUiStore } from '@/stores/ui-store';
import type { TradeSearchRequestInterceptor } from './services/trade-search-request-interceptor';

type UiStore = ReturnType<typeof useUiStore>;

const ENHANCED_ATTRIBUTE = 'data-ptp-chaos-divine-search-enhanced';
const HOST_CLASS = 'ptp-search-input-enhanced';
const SWITCH_CLASS = 'ptp-chaos-divine-switch';

export class ChaosDivineSearchEnhancer {
    private stopObserving: (() => void) | null = null;

    constructor(
        private readonly adapter: TradeSiteAdapter,
        private readonly interceptor: TradeSearchRequestInterceptor,
        private readonly uiStore: UiStore
    ) {}

    start(): void {
        if (this.stopObserving) return;
        const result = this.interceptor.start();
        if (!result.success) {
            this.uiStore.notify('安装混沌/神圣请求增强器失败', 'error');
            return;
        }

        this.interceptor.setEnabled(this.uiStore.chaosDivineFilterEnabled);
        this.stopObserving = this.adapter.observeSearchInputContainer(container => {
            this.enhance(container);
        });
    }

    dispose(): void {
        this.stopObserving?.();
        this.stopObserving = null;
        this.interceptor.dispose();
        document.querySelectorAll<HTMLElement>(`[${ENHANCED_ATTRIBUTE}]`).forEach(element => {
            element.remove();
        });
        document.querySelectorAll<HTMLElement>(`.${HOST_CLASS}`).forEach(container => {
            container.classList.remove(HOST_CLASS);
        });
    }

    private enhance(container: HTMLElement): void {
        if (!container.classList.contains(HOST_CLASS)) container.classList.add(HOST_CLASS);
        let switchElement = container.querySelector<HTMLLabelElement>(`[${ENHANCED_ATTRIBUTE}]`);
        if (!switchElement) {
            switchElement = this.createSwitch();
            container.appendChild(switchElement);
        }
        this.syncSwitch(switchElement);
    }

    private createSwitch(): HTMLLabelElement {
        const label = document.createElement('label');
        label.className = SWITCH_CLASS;
        label.title = '开启后，点击原生搜索时会合并混沌/神圣价格过滤';
        label.setAttribute(ENHANCED_ATTRIBUTE, 'true');
        label.addEventListener('click', event => event.stopPropagation());

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.setAttribute('aria-label', '混沌/神圣价格过滤');
        input.addEventListener('change', () => {
            void this.updateEnabled(input, label);
        });

        const track = document.createElement('span');
        track.className = 'ptp-chaos-divine-switch-track';
        const thumb = document.createElement('span');
        thumb.className = 'ptp-chaos-divine-switch-thumb';
        track.appendChild(thumb);

        const text = document.createElement('span');
        text.className = 'ptp-chaos-divine-switch-label';
        text.textContent = '混/神';
        label.append(input, track, text);
        return label;
    }

    private async updateEnabled(input: HTMLInputElement, label: HTMLLabelElement): Promise<void> {
        if (input.disabled) return;
        const enabled = input.checked;
        input.disabled = true;
        try {
            const result = await this.uiStore.setChaosDivineFilterEnabled(enabled);
            if (!result.success) return;
            this.interceptor.setEnabled(enabled);
        } catch (error) {
            console.error('[POE Trade Plugin] 保存混沌/神圣开关状态失败', error);
            this.uiStore.notify('保存混沌/神圣开关状态失败', 'error');
        } finally {
            input.disabled = false;
            this.syncSwitch(label);
        }
    }

    private syncSwitch(label: HTMLLabelElement): void {
        const input = label.querySelector<HTMLInputElement>('input[type="checkbox"]');
        if (!input) return;
        const enabled = this.uiStore.chaosDivineFilterEnabled;
        if (input.checked !== enabled) input.checked = enabled;
        if (label.classList.contains('is-active') !== enabled) {
            label.classList.toggle('is-active', enabled);
        }
    }
}
