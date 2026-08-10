import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import SidebarApp from '@/app/SidebarApp/index.vue';
import { tradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import { PinnedItemsEnhancer } from '@/features/pinned-items/pinned-items-enhancer';
import { ClusterJewelEnhancer } from '@/features/cluster-jewels/cluster-jewel-enhancer';
import { ItemTranslationEnhancer } from '@/features/item-translation/item-translation-enhancer';
import { ChaosDivineSearchEnhancer } from '@/features/search-optimization/chaos-divine-search-enhancer';
import { TradeSearchRequestInterceptor } from '@/features/search-optimization/services/trade-search-request-interceptor';
import { ResultEnhancerRunner } from '@/result-enhancers/result-enhancer-runner';
import { RouteObserver } from '@/services/route-observer';
import { useBookmarksStore } from '@/stores/bookmarks-store';
import { useHistoryStore } from '@/stores/history-store';
import { usePinnedItemsStore } from '@/stores/pinned-items-store';
import { useTradeStore } from '@/stores/trade-store';
import { useUiStore } from '@/stores/ui-store';
import 'virtual:uno.css';
import '@/style.css';

const APP_ROOT_ID = 'poe-trade-plugin';

const bootstrap = async (): Promise<void> => {
    console.info('[POE Trade Plugin] 用户脚本已加载', window.location.href);
    if (document.getElementById(APP_ROOT_ID)) {
        console.warn('[POE Trade Plugin] 检测到已有插件实例，跳过重复启动');
        return;
    }
    console.info('[POE Trade Plugin] 3.1.0 开始启动', window.location.href);

    try {
        const pinia = createPinia();
        setActivePinia(pinia);
        const bookmarksStore = useBookmarksStore();
        const historyStore = useHistoryStore();
        const pinnedStore = usePinnedItemsStore();
        const tradeStore = useTradeStore();
        const uiStore = useUiStore();

        const mountNode = document.createElement('div');
        mountNode.id = APP_ROOT_ID;
        document.body.appendChild(mountNode);
        createApp(SidebarApp).use(pinia).mount(mountNode);
        console.info('[POE Trade Plugin] 侧栏已挂载');

        const initializationResults = await Promise.all([
            bookmarksStore.initialize(),
            historyStore.initialize(),
            uiStore.initialize(),
        ]);

        initializationResults
            .filter(result => !result.success)
            .forEach(result => {
                if (!result.success) uiStore.notify(result.error, 'error');
            });

        await tradeSiteAdapter.waitForTradeRoot();
        tradeSiteAdapter.setSidebarExpanded(uiStore.expanded);

        const routeObserver = new RouteObserver(tradeSiteAdapter, (location, previousLocation) => {
            const title = tradeSiteAdapter.recommendSearchTitle();
            tradeStore.setCurrentSearch(location, title);
            if (previousLocation && location?.slug !== previousLocation.slug) pinnedStore.clear();
            if (location) {
                void historyStore.record(location, title).then(result => {
                    if (!result.success) uiStore.notify(result.error, 'error');
                });
            }
        });

        const pinnedEnhancer = new PinnedItemsEnhancer(tradeSiteAdapter, pinnedStore, uiStore);
        const clusterJewelEnhancer = new ClusterJewelEnhancer(tradeSiteAdapter);
        const itemTranslationEnhancer = new ItemTranslationEnhancer(tradeSiteAdapter, uiStore);
        const tradeSearchRequestInterceptor = new TradeSearchRequestInterceptor(unsafeWindow);
        const chaosDivineSearchEnhancer = new ChaosDivineSearchEnhancer(
            tradeSiteAdapter,
            tradeSearchRequestInterceptor,
            uiStore
        );
        const enhancerRunner = new ResultEnhancerRunner(tradeSiteAdapter, [
            pinnedEnhancer,
            clusterJewelEnhancer,
            itemTranslationEnhancer,
        ]);
        routeObserver.start();
        enhancerRunner.start();
        chaosDivineSearchEnhancer.start();

        window.addEventListener(
            'beforeunload',
            () => {
                routeObserver.dispose();
                enhancerRunner.dispose();
                chaosDivineSearchEnhancer.dispose();
            },
            { once: true }
        );
    } catch (error) {
        console.error('[POE Trade Plugin] 启动失败', error);
    }
};

void bootstrap();
