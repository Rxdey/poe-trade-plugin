import type { TradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import type { TradeResultEnhancer } from './types';

export class ResultEnhancerRunner {
    private stopObserving: (() => void) | null = null;

    constructor(
        private readonly adapter: TradeSiteAdapter,
        private readonly enhancers: TradeResultEnhancer[]
    ) {}

    start(): void {
        this.stopObserving = this.adapter.observeResults(rows => {
            if (!rows.length) {
                this.enhancers.forEach(enhancer => enhancer.clear());
                return;
            }
            rows.forEach(row => this.enhancers.forEach(enhancer => enhancer.enhance(row)));
        });
    }

    dispose(): void {
        this.stopObserving?.();
        this.enhancers.forEach(enhancer => enhancer.dispose());
    }
}
