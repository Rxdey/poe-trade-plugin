import { ZhToEn } from 'cn-poe-translator';
import { failureResult, successResult, type OperationResult } from '@/types';

type TextTranslator = InstanceType<(typeof ZhToEn)['TextTranslator']>;

let textTranslator: TextTranslator | null = null;

const getTextTranslator = (): TextTranslator => {
    if (textTranslator) return textTranslator;
    if (typeof CnPoeExportDb === 'undefined') {
        throw new Error(
            '翻译数据库未加载，请检查 https://cdn.jsdelivr.net/npm/cn-poe-export-db@0.8.5/dist/db.global.js'
        );
    }
    const factory = new ZhToEn.TranslatorFactory(CnPoeExportDb);
    textTranslator = factory.getTextTranslator();
    return textTranslator;
};

/** 将国服复制的装备文本翻译为英文。 */
export const translateItemText = (text: string): OperationResult<string> => {
    try {
        const normalizedText = text.replace(/\r\n?/g, '\n').trim();
        if (!normalizedText) throw new Error('请先提供需要翻译的装备文本');
        const translatedText = getTextTranslator().trans(normalizedText);
        if (!translatedText.trim()) throw new Error('翻译结果为空');
        return successResult(translatedText);
    } catch (error) {
        return failureResult(error, '翻译装备文本失败');
    }
};
