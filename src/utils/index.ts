import CnPoeExportDb from 'cn-poe-export-db';
import { BasicTranslatorFactory } from "cn-poe-translator";

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
