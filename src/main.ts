import { createApp } from 'vue';
import Translate from './container/Translate/Translate.vue';
import moreTool from './container/More';
import 'virtual:uno.css';
import './style.css';

/**
 * 网页市集物品转换为英文
 * 用于导入pob
 */
if (/poe\.game\.qq\.com\/trade/.test(window.location.href)) {
    const app = createApp(Translate);
    app.mount(
        (() => {
            const app = document.createElement('div');
            app.id = 'poe-trade-plugin';
            document.body.append(app);
            return app;
        })()
    );
    moreTool();
}
/**
 * 登录后重定向不跳转修复
 */
if (/apps\.game\.qq\.com/.test(window.location.href)) {
    setTimeout(() => {
        window.parent.location.replace('https://poe.game.qq.com/');
    }, 500);
}
