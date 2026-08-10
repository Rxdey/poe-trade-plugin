import { failureResult, successResult, type OperationResult } from '@/types';

type JsonObject = Record<string, unknown>;

interface XhrRequestMeta {
    /** 请求方法。 */
    method: string;
    /** 请求地址。 */
    url: string;
}

const SEARCH_API_PATH = /^\/api\/trade\/search(?:\/|$)/;
const CHAOS_DIVINE_OPTION = 'chaos_divine';

const isJsonObject = (value: unknown): value is JsonObject =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const getOrCreateObject = (parent: JsonObject, key: string): JsonObject => {
    const current = parent[key];
    if (isJsonObject(current)) return current;
    const created: JsonObject = {};
    parent[key] = created;
    return created;
};

export class TradeSearchRequestInterceptor {
    private enabled = false;
    private started = false;
    private originalFetch: typeof window.fetch | null = null;
    private patchedFetch: typeof window.fetch | null = null;
    private originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
    private patchedXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
    private originalXhrSend: typeof XMLHttpRequest.prototype.send | null = null;
    private patchedXhrSend: typeof XMLHttpRequest.prototype.send | null = null;
    private readonly xhrRequests = new WeakMap<XMLHttpRequest, XhrRequestMeta>();

    constructor(private readonly pageWindow: Window & typeof globalThis) {}

    start(): OperationResult {
        if (this.started) return successResult(undefined);
        try {
            this.patchFetch();
            this.patchXmlHttpRequest();
            this.started = true;
            console.info('[POE Trade Plugin] 交易搜索请求增强器已安装');
            return successResult(undefined);
        } catch (error) {
            this.dispose();
            return failureResult(error, '安装交易搜索请求增强器失败');
        }
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        console.info(`[POE Trade Plugin] 混沌/神圣请求增强已${enabled ? '开启' : '关闭'}`);
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    dispose(): void {
        this.enabled = false;
        const xhrPrototype = this.pageWindow.XMLHttpRequest.prototype;
        if (this.originalFetch && this.pageWindow.fetch === this.patchedFetch) {
            this.pageWindow.fetch = this.originalFetch;
        }
        if (this.originalXhrOpen && xhrPrototype.open === this.patchedXhrOpen) {
            xhrPrototype.open = this.originalXhrOpen;
        }
        if (this.originalXhrSend && xhrPrototype.send === this.patchedXhrSend) {
            xhrPrototype.send = this.originalXhrSend;
        }
        this.started = false;
    }

    private patchFetch(): void {
        const interceptor = this;
        const originalFetch = this.pageWindow.fetch;
        const patchedFetch: typeof window.fetch = async (input, init) => {
            if (!interceptor.enabled) return originalFetch.call(interceptor.pageWindow, input, init);

            try {
                const patched = await interceptor.patchFetchArguments(input, init);
                return originalFetch.call(interceptor.pageWindow, patched.input, patched.init);
            } catch (error) {
                console.error('[POE Trade Plugin] 改写 fetch 搜索请求失败，将发送原请求', error);
                return originalFetch.call(interceptor.pageWindow, input, init);
            }
        };

        this.originalFetch = originalFetch;
        this.patchedFetch = patchedFetch;
        this.pageWindow.fetch = patchedFetch;
    }

    private patchXmlHttpRequest(): void {
        const interceptor = this;
        const xhrPrototype = this.pageWindow.XMLHttpRequest.prototype;
        const originalOpen = xhrPrototype.open;
        const originalSend = xhrPrototype.send;

        const patchedOpen = function (
            this: XMLHttpRequest,
            method: string,
            url: string | URL,
            async: boolean = true,
            username?: string | null,
            password?: string | null
        ): void {
            interceptor.xhrRequests.set(this, { method: method.toUpperCase(), url: String(url) });
            if (username !== undefined || password !== undefined) {
                originalOpen.call(this, method, url, async, username ?? null, password ?? null);
                return;
            }
            originalOpen.call(this, method, url, async);
        } as typeof XMLHttpRequest.prototype.open;

        const patchedSend = function (
            this: XMLHttpRequest,
            body?: Document | XMLHttpRequestBodyInit | null
        ): void {
            const meta = interceptor.xhrRequests.get(this);
            if (
                interceptor.enabled &&
                meta &&
                interceptor.isTradeSearchRequest(meta.url, meta.method) &&
                typeof body === 'string'
            ) {
                originalSend.call(this, interceptor.mergeSearchBody(body));
                return;
            }
            originalSend.call(this, body);
        } as typeof XMLHttpRequest.prototype.send;

        this.originalXhrOpen = originalOpen;
        this.patchedXhrOpen = patchedOpen;
        this.originalXhrSend = originalSend;
        this.patchedXhrSend = patchedSend;
        xhrPrototype.open = patchedOpen;
        xhrPrototype.send = patchedSend;
    }

    private async patchFetchArguments(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<{ input: RequestInfo | URL; init?: RequestInit }> {
        const isRequest = input instanceof this.pageWindow.Request;
        const method = (init?.method ?? (isRequest ? input.method : 'GET')).toUpperCase();
        const url = isRequest ? input.url : String(input);
        if (!this.isTradeSearchRequest(url, method)) return { input, init };

        if (typeof init?.body === 'string') {
            return { input, init: { ...init, body: this.mergeSearchBody(init.body) } };
        }
        if (!isRequest) return { input, init };

        const body = await input.clone().text();
        const patchedRequest = new this.pageWindow.Request(input, {
            body: this.mergeSearchBody(body),
        });
        return { input: patchedRequest, init };
    }

    private isTradeSearchRequest(url: string, method: string): boolean {
        if (method !== 'POST') return false;
        try {
            const parsedUrl = new URL(url, this.pageWindow.location.href);
            return (
                parsedUrl.origin === this.pageWindow.location.origin &&
                SEARCH_API_PATH.test(parsedUrl.pathname)
            );
        } catch (error) {
            console.error('[POE Trade Plugin] 解析交易搜索请求地址失败', error);
            return false;
        }
    }

    private mergeSearchBody(body: string): string {
        try {
            const payload: unknown = JSON.parse(body);
            if (!isJsonObject(payload)) throw new Error('搜索请求体不是 JSON 对象');

            const query = getOrCreateObject(payload, 'query');
            const filters = getOrCreateObject(query, 'filters');
            const tradeFilters = getOrCreateObject(filters, 'trade_filters');
            const tradeFilterValues = getOrCreateObject(tradeFilters, 'filters');
            const price = getOrCreateObject(tradeFilterValues, 'price');
            tradeFilters.disabled = false;
            price.option = CHAOS_DIVINE_OPTION;
            console.info('[POE Trade Plugin] 已向交易搜索请求合并混沌/神圣价格过滤');
            return JSON.stringify(payload);
        } catch (error) {
            console.error('[POE Trade Plugin] 合并交易搜索请求参数失败，将发送原请求', error);
            return body;
        }
    }
}
