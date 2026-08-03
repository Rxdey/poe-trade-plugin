# 项目开发约定

## 技术栈

- 使用 pnpm、Vue 3、TypeScript、Vite、Pinia、UnoCSS 和 vite-plugin-monkey。
- 仅支持 Chrome + Tampermonkey，目标页面为国服 `/trade/search`。

## 模块归位

- `src/adapters` 只处理市集 DOM、选择器和地址解析，业务组件不得直接查询市集 DOM。
- `src/features` 按收藏、历史、固定商品分域；组件只负责展示与交互绑定。
- GM 存储、导入导出放 `src/data`，全局状态按业务域放 `src/stores`。
- 跨业务复用组件放 `src/components`，复杂交互放 `src/composables` 或 `src/services`。
- 商品结果扩展统一实现 `TradeResultEnhancer`，不要新建平行 MutationObserver。

## 编码和校验

- 避免 `any`，异常必须打印并返回明确失败结果，不允许吞错。
- 不恢复翻译、快捷搜索、通货页或旧星团实现，除非需求明确提出。
- 修改后只执行 `pnpm exec vue-tsc --noEmit`；不执行 lint。
