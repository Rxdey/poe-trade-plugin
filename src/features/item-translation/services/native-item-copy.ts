import { failureResult, successResult, type OperationResult } from '@/types';

const COPY_CAPTURE_TIMEOUT = 600;

const readTextControlSelection = (element: Element | null): string => {
    if (!(element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement)) return '';
    const start = element.selectionStart ?? 0;
    const end = element.selectionEnd ?? element.value.length;
    return element.value.slice(start, end) || element.value;
};

const readCopyEventText = (event: ClipboardEvent): string => {
    const clipboardText = event.clipboardData?.getData('text/plain') ?? '';
    if (clipboardText.trim()) return clipboardText;
    const activeText = readTextControlSelection(document.activeElement);
    if (activeText.trim()) return activeText;
    return window.getSelection()?.toString() ?? '';
};

const isLikelyItemText = (text: string): boolean =>
    text.trim().length >= 20 && /(?:物品类别|稀\s*有\s*度|-{8,})/.test(text);

/** 触发交易页原生复制，并捕获它生成的完整装备文本。 */
export const captureNativeItemText = (
    triggerNativeCopy: () => boolean
): Promise<OperationResult<string>> =>
    new Promise(resolve => {
        let settled = false;
        let timeoutId = 0;

        const cleanup = (): void => {
            document.removeEventListener('copy', handleCopy, true);
            if (timeoutId) window.clearTimeout(timeoutId);
        };

        const finish = async (capturedText: string): Promise<void> => {
            if (settled) return;
            settled = true;
            cleanup();
            if (isLikelyItemText(capturedText)) {
                resolve(successResult(capturedText));
                return;
            }
            try {
                const clipboardText = await navigator.clipboard.readText();
                if (!isLikelyItemText(clipboardText)) {
                    throw new Error('剪贴板中没有检测到完整装备文本');
                }
                resolve(successResult(clipboardText));
            } catch (error) {
                resolve(failureResult(error, '获取交易页装备文本失败'));
            }
        };

        const handleCopy = (event: ClipboardEvent): void => {
            void finish(readCopyEventText(event));
        };

        document.addEventListener('copy', handleCopy, true);
        timeoutId = window.setTimeout(() => void finish(''), COPY_CAPTURE_TIMEOUT);

        try {
            if (!triggerNativeCopy()) throw new Error('未找到交易页原生复制目标');
        } catch (error) {
            settled = true;
            cleanup();
            resolve(failureResult(error, '触发交易页复制失败'));
        }
    });
