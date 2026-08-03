export interface TradeResultEnhancer {
    key: string;
    enhance(row: HTMLElement): void;
    clear(): void;
    dispose(): void;
}
