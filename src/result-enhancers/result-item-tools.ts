const TOOLS_CLASS = 'ptp-result-item-tools';
const HOST_CLASS = 'ptp-result-item-tools-host';

/** 获取或创建商品图下方的插件工具区。 */
export const ensureResultItemTools = (renderedItem: HTMLElement): HTMLElement => {
    const existingTools = renderedItem.querySelector<HTMLElement>(`:scope > .${TOOLS_CLASS}`);
    if (existingTools) return existingTools;

    const tools = document.createElement('div');
    tools.className = TOOLS_CLASS;
    tools.setAttribute('data-ptp-snapshot-exclude', 'true');
    renderedItem.classList.add(HOST_CLASS);
    renderedItem.appendChild(tools);
    return tools;
};

/** 移除单个工具入口，并在工具区为空时清理宿主样式。 */
export const removeResultItemTool = (entry: HTMLElement): void => {
    const tools = entry.parentElement;
    const renderedItem = tools?.parentElement;
    entry.remove();
    if (!tools || tools.childElementCount > 0) return;
    tools.remove();
    renderedItem?.classList.remove(HOST_CLASS);
};
