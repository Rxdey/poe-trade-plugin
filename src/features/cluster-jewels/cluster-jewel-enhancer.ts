import type { TradeSiteAdapter } from '@/adapters/poe-cn/trade-site-adapter';
import type { TradeResultEnhancer } from '@/result-enhancers/types';
import { ensureResultItemTools, removeResultItemTool } from '@/result-enhancers/result-item-tools';
import { parseLargeClusterJewel } from './services/cluster-parser';
import { createClusterPreview } from './services/cluster-preview';
import type { ClusterJewelAnalysis } from './types';

const ENHANCED_ATTRIBUTE = 'data-ptp-cluster-jewel-enhanced';
const ENTRY_CLASS = 'ptp-cluster-entry';

export class ClusterJewelEnhancer implements TradeResultEnhancer {
    key = 'cluster-jewels';
    private activePopover: HTMLElement | null = null;
    private activeButton: HTMLButtonElement | null = null;
    private closeTimer: number | null = null;

    constructor(private readonly adapter: TradeSiteAdapter) {
        document.addEventListener('pointerdown', this.handleDocumentPointerDown);
        window.addEventListener('scroll', this.handleScroll, true);
        window.addEventListener('resize', this.closePopover);
    }

    enhance(row: HTMLElement): void {
        const renderedItem = this.adapter.getResultRenderedItem(row);
        if (!renderedItem) return;
        if (renderedItem.hasAttribute(ENHANCED_ATTRIBUTE)) {
            if (renderedItem.querySelector(`.${ENTRY_CLASS}`)) return;
            renderedItem.removeAttribute(ENHANCED_ATTRIBUTE);
        }

        const analysis = parseLargeClusterJewel(this.adapter.getResultDetailsText(row));
        if (!analysis) return;

        const entry = document.createElement('span');
        entry.className = ENTRY_CLASS;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ptp-cluster-entry-button';
        button.textContent = '天赋位置';
        button.title = '该功能尚在实验中，不保证位置内容完全准确';
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            this.openPopover(button, analysis);
        });
        button.addEventListener('mouseenter', () => this.openPopover(button, analysis));
        button.addEventListener('mouseleave', this.scheduleClosePopover);
        button.addEventListener('focus', () => this.openPopover(button, analysis));
        button.addEventListener('blur', this.scheduleClosePopover);
        entry.appendChild(button);
        ensureResultItemTools(renderedItem).appendChild(entry);
        renderedItem.setAttribute(ENHANCED_ATTRIBUTE, 'true');
    }

    clear(): void {
        this.closePopover();
    }

    dispose(): void {
        this.closePopover();
        document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
        window.removeEventListener('scroll', this.handleScroll, true);
        window.removeEventListener('resize', this.closePopover);
        document.querySelectorAll<HTMLElement>(`.${ENTRY_CLASS}`).forEach(removeResultItemTool);
        document.querySelectorAll<HTMLElement>(`[${ENHANCED_ATTRIBUTE}]`).forEach(element => {
            element.removeAttribute(ENHANCED_ATTRIBUTE);
        });
    }

    private openPopover(button: HTMLButtonElement, analysis: ClusterJewelAnalysis): void {
        if (this.activeButton === button && this.activePopover) return;
        this.closePopover();
        const popover = this.createPopover(analysis);
        popover.addEventListener('mouseenter', this.cancelScheduledClose);
        popover.addEventListener('mouseleave', this.scheduleClosePopover);
        document.body.appendChild(popover);
        this.positionPopover(button, popover);
        button.setAttribute('aria-expanded', 'true');
        this.activeButton = button;
        this.activePopover = popover;
    }

    private createPopover(analysis: ClusterJewelAnalysis): HTMLElement {
        const popover = document.createElement('section');
        popover.className = 'ptp-cluster-popover';
        popover.setAttribute('role', 'tooltip');
        popover.setAttribute('aria-label', '大型星团天赋位置');
        popover.appendChild(createClusterPreview(analysis));
        return popover;
    }

    private positionPopover(button: HTMLButtonElement, popover: HTMLElement): void {
        const buttonRect = button.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const gap = 10;
        const edge = 12;
        const preferredLeft = buttonRect.right + gap;
        const left = preferredLeft + popoverRect.width <= window.innerWidth - edge
            ? preferredLeft
            : Math.max(edge, buttonRect.left - popoverRect.width - gap);
        const top = Math.min(
            Math.max(edge, buttonRect.top - 18),
            Math.max(edge, window.innerHeight - popoverRect.height - edge)
        );
        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
    }

    private closePopover = (): void => {
        this.cancelScheduledClose();
        this.activePopover?.remove();
        this.activeButton?.setAttribute('aria-expanded', 'false');
        this.activePopover = null;
        this.activeButton = null;
    };

    private scheduleClosePopover = (): void => {
        this.cancelScheduledClose();
        this.closeTimer = window.setTimeout(this.closePopover, 120);
    };

    private cancelScheduledClose = (): void => {
        if (this.closeTimer === null) return;
        window.clearTimeout(this.closeTimer);
        this.closeTimer = null;
    };

    private handleDocumentPointerDown = (event: PointerEvent): void => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        if (this.activePopover?.contains(target) || this.activeButton?.contains(target)) return;
        this.closePopover();
    };

    private handleScroll = (event: Event): void => {
        const target = event.target;
        if (target instanceof Node && this.activePopover?.contains(target)) return;
        this.closePopover();
    };
}
