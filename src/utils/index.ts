import CnPoeExportDb from 'cn-poe-export-db';
import { BasicTranslatorFactory } from 'cn-poe-translator';

/** 复制文本 */
export const copyToClipboard = (txt = '', cb = () => {}) => {
    const node = document.createElement('textarea');
    node.value = txt;
    document.body.appendChild(node);
    node.select();
    document.execCommand('Copy');
    document.body.removeChild(node);
    cb();
};
/** 翻译 */
export const translateItem = (text: string) => {
    if (!text) return;
    const factory = new BasicTranslatorFactory(CnPoeExportDb);
    const textTranslator = factory.getTextTranslator();
    return textTranslator.translate(text);
};

export const importFile = (): Promise<FileList | null> => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/plain';
    input.hidden = true;
    input.style.width = '0px';
    input.style.height = '0px';
    input.style.position = 'absolute';
    document.body.appendChild(input);
    input.click();
    return new Promise((resolve, reject) => {
        input.onchange = (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            resolve(files);
        };
    });
};

export const readFile = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event: any) => {
            resolve(event.target.result);
        };

        reader.onerror = error => {
            reject(error);
        };

        reader.readAsText(file);
    });
};

// 导出txt文件的工具方法
export const exportTxtFile = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

// 检查txt配置文件是否符合指定类型
export const isValidConfig = (config: any) => {
    if (!Array.isArray(config)) return false;
    for (const item of config) {
        if (typeof item !== 'object' || typeof item.value !== 'string') return false;
    }
    // 如果通过以上检查，则认为配置文件符合类型
    return true;
};

export function mergeAndRemoveDuplicates(arr1: any[], arr2: any[]) {
    const mergedArray = [...arr1, ...arr2];
    const map = new Map();
    mergedArray.forEach(item => {
        const key = item.label + item.value;
        if (!map.has(key)) {
            map.set(key, item);
        }
    });
    const uniqueArray = Array.from(map.values());
    return uniqueArray;
}
