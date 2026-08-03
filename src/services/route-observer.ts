import type { TradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import type { SearchLocation } from '@/types';

type LocationChangeHandler = (location: SearchLocation | null, previousLocation: SearchLocation | null) => void;

export class RouteObserver {
    private currentLocation: SearchLocation | null = null;
    private intervalId: number | null = null;
    private readonly originalPushState = window.history.pushState;
    private readonly originalReplaceState = window.history.replaceState;

    constructor(
        private readonly adapter: TradeSiteAdapter,
        private readonly onChange: LocationChangeHandler
    ) {}

    start(): void {
        window.addEventListener('popstate', this.checkLocation);

        window.history.pushState = (...args) => {
            this.originalPushState.apply(window.history, args);
            this.checkLocation();
        };
        window.history.replaceState = (...args) => {
            this.originalReplaceState.apply(window.history, args);
            this.checkLocation();
        };

        this.intervalId = window.setInterval(() => {
            if (document.hasFocus()) this.checkLocation();
        }, 500);
        this.checkLocation();
    }

    dispose(): void {
        window.removeEventListener('popstate', this.checkLocation);
        window.history.pushState = this.originalPushState;
        window.history.replaceState = this.originalReplaceState;
        if (this.intervalId !== null) window.clearInterval(this.intervalId);
    }

    private checkLocation = (): void => {
        const nextLocation = this.adapter.parseLocation(new URL(window.location.href));
        const previousLocation = this.currentLocation;
        const previousKey = previousLocation ? `${previousLocation.league}/${previousLocation.slug}` : '';
        const nextKey = nextLocation ? `${nextLocation.league}/${nextLocation.slug}` : '';
        if (previousKey === nextKey) return;
        this.currentLocation = nextLocation;
        this.onChange(nextLocation, previousLocation);
    };
}
