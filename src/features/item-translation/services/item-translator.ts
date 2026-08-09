import { TranslatorFactory, type TextTranslator } from 'cn-poe-utils/translator/zh2en';
import { failureResult, successResult, type OperationResult } from '@/types';

let textTranslator: TextTranslator | null = null;

const getTextTranslator = (): TextTranslator => {
    if (textTranslator) return textTranslator;
    const factory = new TranslatorFactory();
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
