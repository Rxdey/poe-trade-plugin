import { CLUSTER_LIST } from '../constants/cluster-data';
import type { ClusterJewelAnalysis } from '../types';

const LARGE_CLUSTER_NAME = '大型星团珠宝';
const PASSIVE_COUNT_PATTERN = /增加\s*(\d+)\s*个天赋技能/;
const ATTRIBUTE_PATTERN = /增加的小天赋获得[：:]\s*([^\n\r]+)/;
const NOTABLE_PATTERN = /其中\s*1\s*个增加的天赋为[：:]?\s*([^\n\r]+)/g;

const normalizeNotableName = (value: string): string => value.replace(/[【】]/g, '').trim();

/** 从国服商品详情文本中解析大型星团位置数据。 */
export const parseLargeClusterJewel = (detailsText: string): ClusterJewelAnalysis | null => {
    if (!detailsText.includes(LARGE_CLUSTER_NAME)) return null;

    const passiveCountMatch = detailsText.match(PASSIVE_COUNT_PATTERN);
    const attributeMatch = detailsText.match(ATTRIBUTE_PATTERN);
    if (!passiveCountMatch || !attributeMatch) return null;

    const notableNames = new Set(
        Array.from(detailsText.matchAll(NOTABLE_PATTERN), match => normalizeNotableName(match[1])).filter(Boolean)
    );

    const attribute = attributeMatch[1].trim();
    const definition = CLUSTER_LIST.find(item => attribute.startsWith(item.attribute));
    const notables = (definition?.detail ?? [])
        .filter(notable => notableNames.has(notable.name))
        .sort((left, right) => left.order - right.order);

    return {
        passiveCount: Number.parseInt(passiveCountMatch[1], 10),
        attribute,
        notables,
    };
};
