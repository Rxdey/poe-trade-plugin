import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey from 'vite-plugin-monkey';
import path from 'node:path';
import UnoCSS from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        UnoCSS(),
        vue(),
        monkey({
            entry: 'src/main.ts',
            userscript: {
                'name': 'POE流放之路网页市集插件',
                'description': '国服网页市集收藏夹、历史记录和固定商品助手',
                'author': 'rxdey',
                'license': 'MIT',
                'icon': 'https://poe.game.qq.com/favicon.ico',
                'namespace': 'http://tampermonkey.net/',
                'match': [
                    'https://poe.game.qq.com/trade/search',
                    'https://poe.game.qq.com/trade/search/*',
                ],
                'include': ['https://poe.game.qq.com/trade/search*'],
                'run-at': 'document-idle',
                'grant': ['GM_getValue', 'GM_setValue', 'GM_deleteValue'],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
