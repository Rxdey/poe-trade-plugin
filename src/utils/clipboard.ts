export const copyText = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error('[POE Trade Plugin] Clipboard API 复制失败，尝试兼容方式', error);
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('浏览器拒绝复制文本');
    }
};
