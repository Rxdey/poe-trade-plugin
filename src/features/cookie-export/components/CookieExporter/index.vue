<template>
    <section class="ptp-cookie-exporter">
        <div v-if="opened" class="ptp-cookie-panel">
            <header class="ptp-quick-translator-header">
                <div>
                    <strong>当前 Cookie</strong>
                    <small>{{ cookieCount ? `共 ${cookieCount} 项，已自动复制` : '正在读取当前交易地址' }}</small>
                </div>
                <button type="button" class="ptp-icon-button" title="关闭 Cookie 面板" @click="close">
                    <span class="i-mdi-close"></span>
                </button>
            </header>

            <div class="ptp-cookie-panel-body">
                <textarea
                    :value="cookieText"
                    readonly
                    spellcheck="false"
                    aria-label="当前交易地址 Cookie"
                    :placeholder="loading ? '正在读取 Cookie…' : '没有可显示的 Cookie'"
                ></textarea>
                <p class="ptp-cookie-warning">
                    Cookie 包含登录凭据，请勿发送给不可信的网站或他人。插件不会保存这些内容。
                </p>
                <button type="button" class="ptp-button is-blue" :disabled="loading || !cookieText" @click="copyAgain">
                    再次复制
                </button>
            </div>
        </div>

        <button
            type="button"
            class="ptp-bottom-tool-button"
            :class="{ 'is-active': opened }"
            :disabled="loading"
            @click="toggle"
        >
            <span :class="loading ? 'i-mdi-loading ptp-spin' : 'i-mdi-cookie'" ></span>
            <span>{{ loading ? '读取中' : '复制 Cookie' }}</span>
        </button>
    </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { exportCurrentCookies } from '@/features/cookie-export/services/cookie-exporter';
import { useUiStore } from '@/stores/ui-store';
import { copyText } from '@/utils/clipboard';

const props = defineProps<{ opened: boolean }>();
const emit = defineEmits<{ 'update:opened': [opened: boolean] }>();
const uiStore = useUiStore();
const loading = ref(false);
const cookieText = ref('');
const cookieCount = ref(0);

/** 清除页面内存中的敏感 Cookie 文本。 */
const clearSensitiveData = (): void => {
    cookieText.value = '';
    cookieCount.value = 0;
};

watch(
    () => props.opened,
    opened => {
        if (!opened) clearSensitiveData();
    }
);

/** 打开面板时即时读取并复制最新 Cookie。 */
const loadAndCopy = async (): Promise<void> => {
    clearSensitiveData();
    loading.value = true;
    try {
        const result = await exportCurrentCookies();
        if (!result.success) {
            uiStore.notify(result.error, 'error');
            return;
        }
        cookieText.value = result.data.text;
        cookieCount.value = result.data.count;
        await copyText(result.data.text);
        uiStore.notify(`已复制 ${result.data.count} 项 Cookie`);
    } catch (error) {
        console.error('[POE Trade Plugin] 展示并复制 Cookie 失败', error);
        uiStore.notify(error instanceof Error ? error.message : '复制 Cookie 失败', 'error');
    } finally {
        loading.value = false;
    }
};

/** 切换 Cookie 面板，重新打开时刷新内容。 */
const toggle = (): void => {
    if (props.opened) {
        emit('update:opened', false);
        return;
    }
    emit('update:opened', true);
    void loadAndCopy();
};

const close = (): void => emit('update:opened', false);

/** 再次复制当前面板中的 Cookie 文本。 */
const copyAgain = async (): Promise<void> => {
    try {
        await copyText(cookieText.value);
        uiStore.notify(`已复制 ${cookieCount.value} 项 Cookie`);
    } catch (error) {
        console.error('[POE Trade Plugin] 再次复制 Cookie 失败', error);
        uiStore.notify(error instanceof Error ? error.message : '复制 Cookie 失败', 'error');
    }
};
</script>
