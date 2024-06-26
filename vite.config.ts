import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn, util } from 'vite-plugin-monkey';
import path from 'node:path';
import UnoCSS from 'unocss/vite'

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
                'require': [
                    'https://cdn.jsdelivr.net/npm/cn-poe-export-db@0.1.5/dist/db.global.js',
                    util.dataUrl(`window.CnPoeExportDb=CnPoeExportDb`)
                ]
            },
            build: {
                externalGlobals: {
                    vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
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
