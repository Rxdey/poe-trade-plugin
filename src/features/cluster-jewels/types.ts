export interface ClusterNotableDefinition {
    /** 显著天赋名称。 */
    name: string;
    /** 该显著天赋的词缀类型。 */
    ps: '前缀' | '后缀';
    /** 在当前基底数据中的位置顺序。 */
    order: number;
}

export interface ClusterJewelDefinition {
    /** 大型星团的小天赋属性。 */
    attribute: string;
    /** 该基底可出现的显著天赋顺序。 */
    detail: ClusterNotableDefinition[];
}

export interface ClusterJewelAnalysis {
    /** 星团环上增加的天赋数量。 */
    passiveCount: number;
    /** 小天赋提供的基础属性。 */
    attribute: string;
    /** 按位置数据排序后的显著天赋。 */
    notables: ClusterNotableDefinition[];
}
