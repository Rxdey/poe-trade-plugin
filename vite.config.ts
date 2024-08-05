import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn, util } from 'vite-plugin-monkey';
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
                'description': '市集一些优化',
                'author': 'rxdey',
                'license': 'MIT',
                'icon': 'https://poe.game.qq.com/favicon.ico',
                'namespace': 'http://tampermonkey.net/',
                'match': ['https://poe.game.qq.com/trade/*', 'https://apps.game.qq.com/poe/a20160407LoginCheck/loginsuccess.html'],
                'run-at': 'document-start',
                'require': ['https://unpkg.com/cn-poe-export-db@0.3.2/dist/db.global.js', util.dataUrl(`window.CnPoeExportDb=CnPoeExportDb`)],
            },
            build: {
                externalGlobals: {
                    // vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
                    // vue: cdn.bootcdn('Vue', 'vue.global.prod.min.js'),
                    vue: cdn.unpkg('Vue', 'dist/vue.global.prod.js'),
                    // https://unpkg.com/Vue/3.2.45/dist/vue.global.prod.js
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
