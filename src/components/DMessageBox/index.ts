import { createApp } from 'vue';
import DMessageBox from './DMessageBox.vue'

export type Props = {
    visible: boolean;
    close?: () => void;
    confirm?: () => void;
    title?: string;
    message?: string;
    showCancel?: boolean;
    cancelText?: string;
    confirmText?: string;
};

const defaultConfig = {
    title: '注意',
    message: '',
    cancelText: '取消',
    confirmText: '确认',
    showCancel: true,
};
export default function showMessageBox(options: Partial<typeof defaultConfig>):Promise<boolean> {
    return new Promise((resolve, reject) => {
        const mountNode = document.createElement('div');
        const dialogApp = createApp(DMessageBox, {
            visible: true,
            ...defaultConfig,
            ...options,
            close: () => {
                resolve(false);
                setTimeout(() => {
                    dialogApp.unmount();
                    document.body.removeChild(mountNode);
                }, 300);
            },
            confirm: () => {
                resolve(true);
                setTimeout(() => {
                    dialogApp.unmount();
                    document.body.removeChild(mountNode);
                }, 300);
            },
        });

        document.body.appendChild(mountNode);
        dialogApp.mount(mountNode);
    });
}
