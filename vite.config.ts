import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
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
                'name': 'POE trade plugin',
                'description': '市集优化',
                'author': 'rxdey',
                'license': 'MIT',
                'icon': 'https://poe.game.qq.com/favicon.ico',
                'namespace': 'npm/vite-plugin-monkey',
                'match': ['https://poe.game.qq.com/trade/*', 'https://apps.game.qq.com/poe/a20160407LoginCheck/loginsuccess.html'],
                'run-at': 'document-start',
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