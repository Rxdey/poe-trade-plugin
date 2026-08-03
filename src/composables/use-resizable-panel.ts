import { onBeforeUnmount, ref, type Ref } from 'vue';

interface ResizablePanelOptions {
    /** 当前面板宽度。 */
    width: Ref<number>;
    /** 允许的最小宽度。 */
    minWidth: number;
    /** 允许的最大宽度。 */
    maxWidth: number;
    /** 拖拽结束后的持久化回调。 */
    onResizeEnd: (width: number) => void | Promise<void>;
}

const clampWidth = (width: number, minWidth: number, maxWidth: number): number =>
    Math.min(maxWidth, Math.max(minWidth, Math.round(width)));

/** 管理右侧面板的左边缘拖拽和键盘调整。 */
export const useResizablePanel = (options: ResizablePanelOptions) => {
    const resizing = ref(false);
    let startX = 0;
    let startWidth = 0;

    const stopListening = (): void => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        document.body.classList.remove('ptp-is-resizing');
    };

    const handlePointerMove = (event: PointerEvent): void => {
        if (!resizing.value) return;
        options.width.value = clampWidth(
            startWidth + startX - event.clientX,
            options.minWidth,
            options.maxWidth
        );
    };

    const handlePointerUp = (): void => {
        if (!resizing.value) return;
        resizing.value = false;
        stopListening();
        void options.onResizeEnd(options.width.value);
    };

    const startResize = (event: PointerEvent): void => {
        if (event.button !== 0) return;
        event.preventDefault();
        startX = event.clientX;
        startWidth = options.width.value;
        resizing.value = true;
        document.body.classList.add('ptp-is-resizing');
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    };

    const resizeBy = (delta: number): void => {
        const width = clampWidth(options.width.value + delta, options.minWidth, options.maxWidth);
        options.width.value = width;
        void options.onResizeEnd(width);
    };

    onBeforeUnmount(stopListening);

    return { resizing, startResize, resizeBy };
};
