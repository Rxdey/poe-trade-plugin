import { copyToClipboard, translateItem } from '@/utils';

/** 沿用原来的监听 */
const injectButton = (cb?: (e: HTMLElement) => void) => {
    const targets = Array.from(document.querySelectorAll('.row[data-id]'));
    if (!targets || !targets.length) return;
    targets.forEach((target: any) => {
        if (target.querySelector('.copy-en')) return;
        const leftEl = target.querySelector('.left');
        if (!leftEl) return;
        const btn = document.createElement('div');
        btn.className = 'copy-en';
        btn.title = '复制英文';
        btn.setAttribute(
            'style',
            `position: absolute;
            left: 84px;
            bottom: 10px;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            text-decoration: underline;`
        );
        btn.innerText = '复制英文';
        leftEl.appendChild(btn);
        btn.addEventListener('click', () => {
            const text = target.__vue__.itemText;
            // 不先放里面翻译不完整
            let textarea = document.createElement('textarea');
            textarea.value = text;
            const res = translateItem(textarea.value);
            copyToClipboard(res);
            target.__vue__.itemTextCopied();
        });
        // console.dir(target);
        if (cb) cb(target);
    });
};

const initObserver = (cb?: (e: HTMLElement) => void) => {
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if ((mutation.target as HTMLElement).className !== 'resultset') return;
            injectButton(cb);
        }
    });
    const targetNode = document.querySelector('body')!;
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);
};

export default initObserver;
