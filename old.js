// ==UserScript==
// @name         POE 网页市集道具转英文2
// @namespace    http://tampermonkey.net/
// @version      0.0.9
// @description  流放之路国服网页市集物品转换为国际服pob物品工具
// @author       Rxdey
// @match        https://poe.game.qq.com/trade/*
// @icon         https://poecdn.game.qq.com/protected/image/tencent/favicon-32x32.png?v=1&key=WDwrBirzWbDsbHkc0BgCMQ
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js

// @require      https://cdn.jsdelivr.net/npm/cn-poe-export-db@0.1.5/dist/db.global.js
// @require      https://cdn.jsdelivr.net/npm/pob-building-creater@0.1.3/dist/creater.global.js
// @require      https://cdn.jsdelivr.net/npm/cn-poe-translator@0.2.8/dist/translator.global.js

// @require      https://cdn.jsdelivr.net/npm/ajax-hook@3.0.3/dist/ajaxhook.min.js
// @grant        GM_addStyle
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/474177/POE%20%E7%BD%91%E9%A1%B5%E5%B8%82%E9%9B%86%E9%81%93%E5%85%B7%E8%BD%AC%E8%8B%B1%E6%96%872.user.js
// @updateURL https://update.greasyfork.org/scripts/474177/POE%20%E7%BD%91%E9%A1%B5%E5%B8%82%E9%9B%86%E9%81%93%E5%85%B7%E8%BD%AC%E8%8B%B1%E6%96%872.meta.js
// ==/UserScript==

(function (win) {
    'use strict';
    /** 新增交易类型改为任何 */
    /** 多层级合并对象 */
    const mergeObjects = (obj1, obj2) => {
        const merged = { ...obj2 };
        for (let key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                if (typeof obj1[key] === 'object' && !Array.isArray(obj1[key]) &&
                    typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
                    merged[key] = mergeObjects(obj1[key], obj2[key]);
                } else {
                    merged[key] = obj1[key];
                }
            }
        }
        return merged;
    };
    const filterTypes = {
        query: {
            filters: {
                trade_filters: {
                    filters: {
                        sale_type: {
                            option: 'any',
                        }
                    }
                }
            }
        }
    };
//     ah.proxy({
//         onRequest: function (config, handler) {
//             const { url, body } = config;
//             if (/\/api\/trade\/search/g.test(url)) {
//                 // 防出错
//                 try {
//                     const newBody = mergeObjects(JSON.parse(body), filterTypes);
//                     config.body = JSON.stringify(newBody);
//                 } catch (error) {

//                 }
//             }
//             handler.next(config);
//         }
//     }, win);
//     win.ah = ah;
    const copyToClipboard = (txt, cb = () => { }) => {
        const node = document.createElement('textarea');
        node.value = txt;
        node.class = 'copy-txt';
        document.body.appendChild(node);
        node.select();
        document.execCommand('Copy');
        document.body.removeChild(node);
        cb();
    };
    const setButton = () => {
        const targets = Array.from(document.querySelectorAll('.row[data-id]'));
        // console.log(targets);
        if (!targets || !targets.length) return;

        targets.forEach(target => {
            if (target.querySelector('.copy-en')) return;
            const leftEl = target.querySelector('.left');
            if (!leftEl) return;
            const btn = document.createElement('div');
            btn.className = 'copy-en';
            btn.title = '复制为英文';
            btn.setAttribute('style', `position: absolute;
            left: 84px;
            bottom: 8px;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            text-decoration: underline;`);
            btn.innerText = '复制为英文';
            leftEl.appendChild(btn);
            btn.addEventListener('click', () => {
                const text = target.__vue__.itemText;
                // 不先放里面翻译不完整
                let textarea = document.createElement('textarea');
                textarea.value = text;
                const factory = CnPoeTranslator.newBasicTranslatorFactory(CnPoeExportDb);
                const textTranslator = factory.getTextTranslator();
                const res = textTranslator.translate(textarea.value);
                textarea = null;
                copyToClipboard(res);
                target.__vue__.itemTextCopied();
            });
        });
    };
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.target.className !== 'resultset') return;
            setButton();
        }
    });
    console.log('翻译复制初始化');
    const targetNode = document.querySelector('body');
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);

    /** 新增翻页面板 添加jquery */
    const createTranslatefield = () => {
        const container = `
        <div class=":uno: field-container">
            <div class=":uno: field-wrap">
                <div id="field-tip"></div>
                <textarea id="field-textarea" class=":uno: field-textarea" type="text" placeholder="在这里粘贴" rows="5"></textarea>
                <div class=":uno: field-button" id="en-button">转换并复制</div>
            </div>
            <div class=":uno: field-button field-button-red" id="close">显示转换界面</div>
        </div>
        `;
        let flag = false;
        $('body').append(container);
        $('#close').click(function () {
            flag = !flag;
            $(this).text(flag ? '隐藏转换界面' : '显示转换界面');
            $('.field-wrap').toggle();
        });
        let st = null;
        $('#en-button').click(() => {
            if (st) clearTimeout(st);
            $('#field-tip').text('');
            const text = $('#field-textarea').val();
            const factory = CnPoeTranslator.newBasicTranslatorFactory(CnPoeExportDb);
            const textTranslator = factory.getTextTranslator();
            const res = textTranslator.translate(text);
            $('#field-textarea').val(res);
            copyToClipboard(res);
            $('#field-tip').text('已复制');
            st = setTimeout(() => {
                $('#field-tip').text('');
            }, 2000);
        });
    };
    createTranslatefield();
    GM_addStyle(`.field-container{position:fixed;bottom:0;left:0;width:200px;z-index:1000}#field-tip{color:#fff;font-size:14px;margin-bottom:5px}.field-wrap{margin-bottom:5px;display:none}.field-textarea{width:100%;font-size:14px;padding:4px 8px;outline:0;border:1px solid #e5e5e5;color:#333;background-color:#fff;resize:none;box-sizing:border-box}.field-btn{display:flex;flex-flow:row nowrap}.field-button{text-align:center;outline:0;border:0;background-color:#3bc7ff;font-size:14px;color:#fff;padding:4px 8px;cursor:pointer;user-select:none;width:100%}.field-button.field-button-red{background-color:#ff5353}`);
})(unsafeWindow);